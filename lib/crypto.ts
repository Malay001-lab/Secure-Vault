export interface VaultData {
  id: string;
  name: string;
  username: string;
  password: string;
  notes?: string;
  createdAt: number;
}

export interface EncryptedVault {
  cipherText: string;
  iv: string;
  salt: string;
  version: number;
  createdAt: number;
  updatedAt?: number;
}

const ALGORITHM_NAME = "AES-GCM";
const KDF_NAME = "PBKDF2";
const HASH_NAME = "SHA-256";
const ITERATIONS = 100000;
const KEY_LENGTH = 256;
export const VAULT_VERSION = 1;

const strToBuf = (str: string) => new TextEncoder().encode(str);
const bufToStr = (buf: ArrayBuffer) => new TextDecoder().decode(buf);
const bufToBase64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};
const base64ToBuf = (str: string) => {
  const binary = window.atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export class CryptoService {
  static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      strToBuf(password),
      { name: KDF_NAME },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: KDF_NAME,
        salt: salt as BufferSource,
        iterations: ITERATIONS,
        hash: HASH_NAME,
      },
      passwordKey,
      { name: ALGORITHM_NAME, length: KEY_LENGTH },
      false,
      ["encrypt", "decrypt"]
    );
  }

  static async encryptWithKey(
    data: VaultData[],
    key: CryptoKey
  ): Promise<{ cipherText: string; iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = strToBuf(JSON.stringify(data));

    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: ALGORITHM_NAME,
        iv: iv,
      },
      key,
      encodedData
    );

    return {
      cipherText: bufToBase64(encryptedContent),
      iv: bufToBase64(iv),
    };
  }

  static async decryptWithKey(
    encryptedVault: EncryptedVault,
    key: CryptoKey
  ): Promise<VaultData[]> {
    const iv = base64ToBuf(encryptedVault.iv);
    const cipherText = base64ToBuf(encryptedVault.cipherText);

    try {
      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: ALGORITHM_NAME,
          iv: iv,
        },
        key,
        cipherText
      );

      return JSON.parse(bufToStr(decryptedContent));
    } catch (e) {
      console.error("Decryption failed", e);
      throw new Error("Invalid password or corrupted data");
    }
  }

  static generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16));
  }

  static saltToString(salt: Uint8Array): string {
    return bufToBase64(salt);
  }

  static stringToSalt(saltStr: string): Uint8Array {
    return new Uint8Array(base64ToBuf(saltStr));
  }
}
