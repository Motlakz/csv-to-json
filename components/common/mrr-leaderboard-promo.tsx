import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function MRRLeaderboardPromoCard() {
  return (
    <motion.div
      className="p-4 rounded-xl border bg-gray-50 dark:bg-slate-900 dark:border-gray-700"
      animate={{
        opacity: [1, 1, 0.95, 1],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        repeatDelay: 120, // every 2 minutes
      }}
    >
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Tired of Fake MRR Screenshots?
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed dark:text-gray-400">
          Share your MRR in public to establish trust and build credibility.
        </p>

        <Link
          href="https://authenticmrr.com?ref=swiftconvert"
          className="text-xs flex items-center gap-1 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium"
        >
          Build Your Trust Today
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
