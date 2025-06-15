import CredentialStore from '../credentials/credential-store';
import { InMemoryStorage } from '../storage';
import { IWalletStorage } from '../types/storage';
import { Oid4VciClient } from '@vdcs/oid4vci-client';
import { type EcPrivateJwk } from '@vdcs/jwt';
import { type CredentialResponse } from '@vdcs/oid4vci';
import { type PresentationFrame } from '@sd-jwt/types';
import { SDJwtInstance } from '@sd-jwt/core';
import { hash } from '../hash';
import { Oid4VpClient, type RequestObject } from '@vdcs/oid4vp-client';
import { P256, normalizePrivateKey } from '@vdcs/jwt';
import { sha256 } from '@sd-jwt/hash';
import { uint8ArrayToBase64Url } from '@sd-jwt/utils';

class WalletSDK {
  credentialStore: CredentialStore;
  jwk: EcPrivateJwk;

  constructor({
    storage,
    jwk,
  }: {
    storage: IWalletStorage;
    jwk: EcPrivateJwk;
  }) {
    this.credentialStore = new CredentialStore(
      storage || new InMemoryStorage(),
    );
    this.jwk = jwk;
  }

  async receive(offerUri: string): Promise<CredentialResponse> {
    const client = await Oid4VciClient.fromOfferUrl(offerUri);
    const credential = await client.getCredential({
      credential_configuration_id:
        client.credentialOffer.credential_configuration_ids[0],
      privateKey: this.jwk,
    });

    return credential;
  }

  async load(requestUri: string): Promise<RequestObject> {
    const client = await Oid4VpClient.fromRequestUri(requestUri);
    return client.request;
  }

  async present<T extends Record<string, unknown>>(
    credential: string,
    presentationFrame: PresentationFrame<T>,
    requestObject: RequestObject,
  ): Promise<string> {
    const { client_id, nonce } = requestObject;
    const sdJwtInstance = new SDJwtInstance({
      hasher: hash,
      kbSignAlg: 'ES256',
      kbSigner: (data: string) => {
        const privateKey = normalizePrivateKey(this.jwk);
        const signingInputBytes = sha256(data);
        const signature = P256.sign(signingInputBytes, privateKey);
        const base64UrlSignature = uint8ArrayToBase64Url(signature);
        return base64UrlSignature;
      },
    });

    const kbPayload = {
      iat: Math.floor(Date.now() / 1000),
      aud: client_id,
      nonce,
    };

    const presentation = await sdJwtInstance.present(
      credential,
      presentationFrame,
      { kb: { payload: kbPayload } },
    );

    const client = new Oid4VpClient(requestObject);
    const result = await client.sendPresenation({ 0: presentation });
    return result;
  }
}

export { WalletSDK };
