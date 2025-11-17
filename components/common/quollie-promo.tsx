"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  MessageSquare,
  Zap,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function QuolliePromo() {
  const [isMinimized, setIsMinimized] = useState(false);

  // Every 2 minutes → auto-expand softly
  useEffect(() => {
    const interval = setInterval(() => {
      setIsMinimized(false); // re-expand
    }, 2 * 60 * 1000); // 120000ms

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {/* MINIMIZED */}
      {isMinimized && (
        <motion.div
          key="mini"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 h-12 px-3 flex items-center gap-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg cursor-pointer select-none z-50"
        >
          <Bot size={16} className="text-violet-500" />
          <span className="text-sm font-medium">Quollie</span>
          <ChevronUp size={14} className="ml-auto" />
        </motion.div>
      )}

      {/* EXPANDED */}
      {!isMinimized && (
        <motion.div
          key="full"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 right-4 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-300 p-3 rounded-xl shadow-xl max-w-[250px] z-50 border dark:border-gray-700 border-gray-200"
        >
          {/* Minimize */}
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
          >
            <ChevronDown size={14} />
          </button>

          <div className="space-y-2">
            <h3 className="font-semibold text-base">Quollie</h3>

            <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
              Automate inbound replies, route leads to CRM, send campaigns, and
              track payments with one lightweight sales engine.
            </p>

            <Link
              href="https://quollie.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 w-full bg-violet-500 hover:bg-pink-500 text-white py-1.5 rounded-md text-sm font-medium transition-all"
            >
              Visit Quollie <ExternalLink size={14} />
            </Link>

            <div className="flex flex-wrap gap-1 pt-1">
              <span className="text-[10px] dark:bg-slate-800 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                <Bot size={10} /> Automated Chats
              </span>
              <span className="text-[10px] dark:bg-slate-800 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                <MessageSquare size={10} /> Multi-Channel
              </span>
              <span className="text-[10px] dark:bg-slate-800 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                <Zap size={10} /> Quick Setup
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
