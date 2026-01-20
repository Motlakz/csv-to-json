import { motion } from 'framer-motion';
import Link from 'next/link';

export function LoveTestPromoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-pink-600 to-purple-600 p-3 sm:p-4 text-white"
    >
      <div className="relative z-10">
        <div className="absolute -top-4 -right-4 p-2 bg-white/20 backdrop-blur-sm rounded-bl-lg text-xs font-medium">
          Love Me?
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">Love Test AI</h3>
        <p className="text-blue-100 mb-4 text-xs sm:text-sm">
          Test your love with a rich assortment of love calculators<br />
          Find out if you are compatible.
        </p>
        <Link
          href="https://lovetestai.com"
          className="p-2 w-full bg-white text-pink-600 rounded-lg font-medium hover:bg-pink-50 transition-colors"
        >
          Take the test
        </Link>
        <div className="absolute -bottom-4 -right-4 p-2 bg-white/20 backdrop-blur-sm rounded-tl-lg text-xs font-medium">
          Love Me Not?
        </div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
    </motion.div>
  );
}
