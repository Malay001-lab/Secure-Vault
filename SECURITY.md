This document explains how Secure Vault handles encryption, key management, and data storage.

The goal of the project is to keep secrets protected from casual inspection while remaining entirely client-side.

---

## Architecture overview

Secure Vault uses a local, zero-knowledge model.

All cryptographic operations happen in the browser using the Web Crypto API. No data is sent to a server and no backend exists.

The application only ever stores encrypted data in persistent storage.

---

## Master password & key derivation

The master password is never saved.

A cryptographic key is derived from the password using PBKDF2 with the following parameters:

- Hash algorithm: SHA-256
- Iterations: 100,000
- Salt: 16-byte random value generated per vault

The derived key exists only in memory while the vault is unlocked. When the vault is locked or the page reloads, the key is discarded.

---

## Encryption

Vault data is encrypted using AES-GCM.

- Key size: 256 bits
- IV: 96-bit random value generated for each encryption operation

AES-GCM was chosen because it provides both confidentiality and integrity, allowing tampering to be detected during decryption.

---

## Data storage

Encrypted vault data is stored in `localStorage` under a single key.

Stored fields include:

- Encrypted vault payload
- Initialization vector (IV)
- Key derivation salt
- Vault format version
- Creation and update timestamps

No plaintext secrets, passwords, or cryptographic keys are ever written to storage.

---

## In-memory handling

When the vault is unlocked:

- Decrypted secrets are kept in React state
- The derived encryption key is kept in memory using a ref
- The salt is cached in memory to avoid repeated reads from storage

When the vault is locked, all of the above are cleared immediately.

---

## Auto-lock behavior

To reduce exposure, the vault locks automatically in two cases:

- When the browser tab becomes hidden or the window loses focus
- After 5 minutes of user inactivity (no mouse, keyboard, touch, or scroll input)

Auto-lock clears all decrypted data and cryptographic material from memory.

---

## Versioning & validation

Each stored vault includes a version number.

On unlock, the application validates that the stored version matches the supported format. If it does not, the vault is not unlocked to avoid accidental corruption or unsafe migrations.

---

## Threat model & limitations

This project protects against:

- Reading secrets directly from localStorage
- Accidental exposure from an unlocked but unattended session

It does not protect against:

- A compromised browser or operating system
- Malicious browser extensions
- Active cross-site scripting vulnerabilities

Because all logic runs client-side, the app must be served over HTTPS in production.

---

## User responsibility

- Choose a strong master password
- Keep the device and browser environment secure
- Understand that forgotten passwords cannot be recovered

There is intentionally no password reset or recovery mechanism.
