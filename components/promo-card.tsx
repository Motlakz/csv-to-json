import React from 'react';
import { motion } from 'framer-motion';

export function PromotionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 p-8 text-white"
    >
      <div className="relative z-10">
        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-4">
          New feature
        </div>
        <h3 className="text-2xl font-bold mb-2">AI Converter</h3>
        <p className="text-blue-100 mb-4 text-sm">
          Vectorize your images with AI<br />
          Extract layers from PDF
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          Try Now
        </motion.button>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
    </motion.div>
  );
}
