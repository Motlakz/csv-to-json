"use client"

import { motion } from 'framer-motion';
import Link from 'next/link';

export function LoveTestPromoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-linear-to-br from-pink-600 to-purple-600 p-4 text-white"
    >
      <div className="relative z-10">
        {/* Corner badge */}
        <div className="absolute -top-4 -right-4 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-bl-lg text-[10px] font-medium">
          Love Me?
        </div>

        <h3 className="text-lg font-bold mb-1.5 pr-12">Love Test AI</h3>
        <p className="text-pink-100 text-xs leading-relaxed mb-3">
          Test your love with a rich assortment of love calculators. Find out if you are compatible.
        </p>

        <Link
          href="https://lovetestai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 bg-white text-pink-600 rounded-lg text-sm font-medium hover:bg-pink-50 transition-colors"
        >
          Take the test
        </Link>

        {/* Bottom corner badge */}
        <div className="absolute -bottom-4 -right-4 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-tl-lg text-[10px] font-medium">
          Love Me Not?
        </div>
      </div>

      {/* Decorative blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
    </motion.div>
  );
}
