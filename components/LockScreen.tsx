"use client";

import React, { useState } from "react";
import { useVault } from "@/context/VaultContext";
import {
  Lock,
  Key,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export function LockScreen() {
  const { hasVault, unlock, createVault, isLoading } = useVault();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (hasVault) {
        const success = await unlock(password);
        if (!success) {
          setError("Incorrect password");
        }
      } else {
        if (password.length < 8) {
          setError("Password must be at least 8 characters");
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsSubmitting(false);
          return;
        }
        await createVault(password);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
            {hasVault ? (
              <Lock className="w-8 h-8 text-indigo-400" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {hasVault ? "Unlock Vault" : "Setup Secure Vault"}
          </h1>
          <p className="text-gray-400">
            {hasVault
              ? "Enter your master password to access your secrets."
              : "Create a master password. This key will encrypt your data locally."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative group">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={
                  hasVault ? "Master Password" : "Create Master Password"
                }
                className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {!hasVault && (
              <div className="relative group">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder-gray-600"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/10 py-2 rounded-lg border border-red-900/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {hasVault ? "Unlock" : "Create Vault"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {!hasVault && (
          <p className="mt-8 text-center text-xs text-gray-500 max-w-xs mx-auto">
            <span className="text-red-400 font-medium">Warning:</span> If you
            forget your master password, your data cannot be recovered. We do
            not store your password.
          </p>
        )}
      </div>
    </div>
  );
}
