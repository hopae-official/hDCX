import * as SecureStore from 'expo-secure-store';
import { IWalletStorage } from '../types/storage';
import * as Crypto from 'expo-crypto';

const KEY_INDEX = 'credential_keys';

class ExpoSecureStore implements IWalletStorage {
  async getItem(key: string) {
    const result = await SecureStore.getItemAsync(key);
    return result ?? null;
  }

  async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
      if (key !== KEY_INDEX) await this.addKeyToIndex(key);
    } catch (error) {
      throw new Error(`Failed to set item: ${(error as Error).message}`);
    }
  }

  async removeItem(key: string) {
    await SecureStore.deleteItemAsync(key);
    if (key !== KEY_INDEX) await this.removeKeyFromIndex(key);
  }

  async clear() {
    const keys = await this.keys();
    for (const key of keys) {
      await SecureStore.deleteItemAsync(key);
    }
    await SecureStore.deleteItemAsync(KEY_INDEX);
  }

  /**
   * Expo Secure Store does not provide an API to list stored keys.
   * To support features like clearing or enumerating stored items,
   * a dedicated key named KEY_INDEX is used to track all stored keys manually.
   */
  async keys() {
    const raw = await SecureStore.getItemAsync(KEY_INDEX);
    return raw ? JSON.parse(raw) : [];
  }

  private async addKeyToIndex(key: string): Promise<void> {
    const keys = await this.keys();
    if (!keys.includes(key)) {
      keys.push(key);
      await SecureStore.setItemAsync(KEY_INDEX, JSON.stringify(keys));
    }
  }

  private async removeKeyFromIndex(key: string): Promise<void> {
    const keys = await this.keys();
    const updated = keys.filter((k: string) => k !== key);
    await SecureStore.setItemAsync(KEY_INDEX, JSON.stringify(updated));
  }

  generateUUID() {
    return Crypto.randomUUID();
  }
}

export { ExpoSecureStore };
