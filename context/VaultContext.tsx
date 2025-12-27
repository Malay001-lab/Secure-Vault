"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  CryptoService,
  VaultData,
  EncryptedVault,
  VAULT_VERSION,
} from "@/lib/crypto";

interface VaultContextType {
  isLocked: boolean;
  isLoading: boolean;
  hasVault: boolean;
  vault: VaultData[];
  unlock: (password: string) => Promise<boolean>;
  createVault: (password: string) => Promise<void>;
  addSecret: (secret: VaultData) => Promise<void>;
  deleteSecret: (id: string) => Promise<void>;
  updateSecret: (secret: VaultData) => Promise<void>;
  lock: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const STORAGE_KEY = "secure_vault_data";

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVault, setHasVault] = useState(false);
  const [vault, setVault] = useState<VaultData[]>([]);

  const cryptoKeyRef = useRef<CryptoKey | null>(null);
  const saltRef = useRef<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      setHasVault(true);
    }
    setIsLoading(false);
  }, []);

  const saveVault = async (newVault: VaultData[]) => {
    try {
      const key = cryptoKeyRef.current;
      const saltStr = saltRef.current;

      if (!key || !saltStr) {
        throw new Error("Cannot save: Vault is locked or not initialized");
      }

      const { cipherText, iv } = await CryptoService.encryptWithKey(
        newVault,
        key
      );

      let originalCreatedAt = Date.now();
      const existingData = localStorage.getItem(STORAGE_KEY);
      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          if (parsed.createdAt) {
            originalCreatedAt = parsed.createdAt;
          }
        } catch {}
      }

      const encryptedVault: EncryptedVault = {
        cipherText,
        iv,
        salt: saltStr,
        version: VAULT_VERSION,
        createdAt: originalCreatedAt,
        updatedAt: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedVault));
      setVault(newVault);
    } catch (error) {
      console.error("Failed to save vault", error);
      throw error;
    }
  };

  const unlock = async (password: string): Promise<boolean> => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return false;

      const encryptedVault: EncryptedVault = JSON.parse(storedData);

      if (encryptedVault.version !== VAULT_VERSION) {
        throw new Error(`Unsupported vault version: ${encryptedVault.version}`);
      }

      const salt = CryptoService.stringToSalt(encryptedVault.salt);

      const key = await CryptoService.deriveKey(password, salt);

      const decryptedVault = await CryptoService.decryptWithKey(
        encryptedVault,
        key
      );

      setVault(decryptedVault);

      cryptoKeyRef.current = key;
      saltRef.current = encryptedVault.salt;

      setIsLocked(false);
      return true;
    } catch (error) {
      console.error("Unlock failed", error);
      cryptoKeyRef.current = null;
      saltRef.current = null;
      return false;
    }
  };

  const createVault = async (password: string) => {
    const salt = CryptoService.generateSalt();
    const key = await CryptoService.deriveKey(password, salt);
    const saltStr = CryptoService.saltToString(salt);

    cryptoKeyRef.current = key;
    saltRef.current = saltStr;

    const emptyVault: VaultData[] = [];

    try {
      const { cipherText, iv } = await CryptoService.encryptWithKey(
        emptyVault,
        key
      );
      const encryptedVault: EncryptedVault = {
        cipherText,
        iv,
        salt: saltStr,
        version: VAULT_VERSION,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedVault));
      setVault(emptyVault);
      setHasVault(true);
      setIsLocked(false);
    } catch (e) {
      console.error("Failed to create vault", e);
      cryptoKeyRef.current = null;
      saltRef.current = null;
    }
  };

  const addSecret = async (secret: VaultData) => {
    if (isLocked) throw new Error("Vault is locked");
    const newVault = [...vault, secret];
    await saveVault(newVault);
  };

  const updateSecret = async (updatedSecret: VaultData) => {
    if (isLocked) throw new Error("Vault is locked");
    const newVault = vault.map((s) =>
      s.id === updatedSecret.id ? updatedSecret : s
    );
    await saveVault(newVault);
  };

  const deleteSecret = async (id: string) => {
    if (isLocked) throw new Error("Vault is locked");
    const newVault = vault.filter((s) => s.id !== id);
    await saveVault(newVault);
  };

  const lock = () => {
    setIsLocked(true);
    setVault([]);
    cryptoKeyRef.current = null;
    saltRef.current = null;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isLocked) {
        lock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLocked]);

  useEffect(() => {
    if (isLocked) return;

    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_LIMIT = 5 * 60 * 1000;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lock();
      }, INACTIVITY_LIMIT);
    };

    resetTimer();

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isLocked]);

  return (
    <VaultContext.Provider
      value={{
        isLocked,
        isLoading,
        hasVault,
        vault,
        unlock,
        createVault,
        addSecret,
        deleteSecret,
        updateSecret,
        lock,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
