"use client";

import { useVault } from "@/context/VaultContext";
import { LockScreen } from "@/components/LockScreen";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const { isLocked, isLoading } = useVault();

  if (isLoading) return null;

  if (isLocked) {
    return <LockScreen />;
  }

  return <Dashboard />;
}
