# hDCX

Simplest Wallet Core SDK for Typescript

With just simple interfaces, you can significantly simplify the credential managing logic in you project. And it also covered in all aspects of speed, robustness, security and privacy to help you build a better experience.

- Fast and lightweight credential managing
- Simple interfaces, easy to understand and use
- Developer friendly, typed and clear error messages

---

<!-- View full documentation on [here]() -->

## Quick Start

```ts
// wallet Initialization
const wallet = new Wallet();

// Request Credentials
const credentials = await wallet.request();

// Save Credentials
await wallet.save(credentials);

// Load Credentials
const loadedCredentials = await wallet.load();

// Present Credentials
const presentation = await wallet.present(loadedCredentials);

// Validate Credentials
const validation = await wallet.validate(presentation);
```

In this example, you can easily

- request credentials
- save & load credentials
- present credentials
- validate credentials

![img](/assets/wallet.png)

## Interoperability

We are interoperable with

| Name        | Interoperable |
| ----------- | ------------- |
| Lissi       | ⌛            |
| Amino Funke | ⌛            |

## License

MIT
