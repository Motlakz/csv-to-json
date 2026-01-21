"use client"

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck } from "lucide-react";
import Link from "next/link";

export function MRRLeaderboardPromoCard() {
  return (
    <motion.div
      className="p-4 rounded-xl border bg-linear-to-br from-cyan-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 dark:border-gray-700 border-cyan-200"
      animate={{
        opacity: [1, 1, 0.95, 1],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        repeatDelay: 120, // every 2 minutes
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Verify Your Revenue
          </h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed dark:text-gray-400">
          Connect your payment processor & share verified MRR. Build trust through transparency.
        </p>

        <Link
          href="https://authenticmrr.com?ref=swiftconvert"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium mt-1"
        >
          Get Verified
          <ArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  );
}
