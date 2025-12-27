"use client";

import React, { useState } from "react";
import { VaultData } from "@/lib/crypto";
import { X, Save, RefreshCw } from "lucide-react";

interface AddSecretModalProps {
  onClose: () => void;
  onSave: (secret: VaultData) => void;
}

export function AddSecretModal({ onClose, onSave }: AddSecretModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    onSave({
      id: crypto.randomUUID(),
      name,
      username,
      password,
      notes,
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden scale-100 opacity-100 transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
          <h2 className="text-xl font-bold text-white">Add New Secret</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Name
            </label>
            <input
              autoFocus
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-600"
              placeholder="e.g. Netflix, Gmail"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Username
            </label>
            <input
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-600"
              placeholder="email@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-600 font-mono pr-12"
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={generatePassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-400 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors"
                title="Generate Password"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-600 min-h-[80px]"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Secret
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
