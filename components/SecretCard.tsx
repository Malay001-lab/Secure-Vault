"use client";

import React, { useState, useEffect } from "react";
import { VaultData } from "@/lib/crypto";
import {
  Copy,
  Eye,
  EyeOff,
  Trash2,
  KeyRound,
  User,
  FileText,
  Check,
} from "lucide-react";

interface SecretCardProps {
  secret: VaultData;
  onDelete: (id: string) => void;
}

export function SecretCard({ secret, onDelete }: SecretCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(secret.password);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="group relative bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-gray-800/50 p-2.5 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform duration-300">
          <KeyRound className="w-5 h-5" />
        </div>
        <button
          onClick={() => onDelete(secret.id)}
          className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
          title="Delete Secret"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <h3 className="text-xl font-bold text-white mb-1 truncate">
        {secret.name}
      </h3>
      <div className="flex items-center text-sm text-gray-400 mb-6 space-x-2">
        <User className="w-3.5 h-3.5" />
        <span className="truncate">{secret.username}</span>
      </div>

      <div className="space-y-3">
        {secret.notes && (
          <div className="text-xs text-gray-500 truncate flex items-center gap-1.5 mb-2">
            <FileText className="w-3 h-3" />
            {secret.notes}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type={isVisible ? "text" : "password"}
              value={secret.password}
              readOnly
              className="w-full bg-gray-950/50 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none font-mono"
            />
          </div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
            title={isVisible ? "Hide Password" : "Show Password"}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-400 hover:text-indigo-400 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
            title="Copy Password"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
