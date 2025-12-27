"use client";

import React, { useState, useMemo } from "react";
import { useVault } from "@/context/VaultContext";
import { SecretCard } from "@/components/SecretCard";
import { AddSecretModal } from "@/components/AddSecretModal";
import { Plus, Search, LogOut, Shield } from "lucide-react";

export function Dashboard() {
  const { vault, lock, addSecret, deleteSecret } = useVault();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVault = useMemo(() => {
    if (!searchQuery) return vault;
    const lower = searchQuery.toLowerCase();
    return vault.filter(
      (secret) =>
        secret.name.toLowerCase().includes(lower) ||
        secret.username.toLowerCase().includes(lower)
    );
  }, [vault, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Secure Vault
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-500">
              {vault.length} {vault.length === 1 ? "Secret" : "Secrets"}
            </div>
            <button
              onClick={lock}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Lock
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search your secrets..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 whitespace-nowrap transform active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add Secret
          </button>
        </div>

        {filteredVault.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              {searchQuery ? "No results found" : "Your vault is empty"}
            </h3>
            <p className="text-gray-500 max-w-sm">
              {searchQuery
                ? "Try searching for a different name or username."
                : "Add your first secret to get started. Securely store passwords, notes, and more."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVault.map((secret) => (
              <SecretCard
                key={secret.id}
                secret={secret}
                onDelete={deleteSecret}
              />
            ))}
          </div>
        )}
      </main>

      {isAddModalOpen && (
        <AddSecretModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={addSecret}
        />
      )}
    </div>
  );
}
