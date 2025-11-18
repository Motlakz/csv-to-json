import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

interface StyledMRRLeaderboardPromoCardProps {
  index?: number;
}

export function StyledMRRLeaderboardPromoCard({ index = 0 }: StyledMRRLeaderboardPromoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative bg-linear-to-br from-cyan-600 to-blue-600 rounded-xl border border-cyan-400 dark:border-cyan-500 p-3 sm:p-4 hover:shadow-lg transition-shadow overflow-hidden text-white z-10"
    >
      {/* Desktop layout */}
      <div className="hidden sm:flex items-center justify-between min-w-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Ad Icon */}
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp className="text-white" size={20} />
          </div>

          {/* Ad Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-white truncate">Authentic MRR</h3>
              <span className="px-2 py-0.5 text-xs rounded-md font-medium bg-white/20 backdrop-blur-sm">
                Revenue
              </span>
              <span className="px-2 py-0.5 text-xs rounded-md font-medium bg-white/20 backdrop-blur-sm">
                Verified
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-cyan-100">
              <span>Verify revenue publicly</span>
              <span>•</span>
              <span>Build trust</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield size={12} />
                Transparency
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <Link
            href="https://authenticmrr.com?ref=swiftconvert"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 rounded-lg font-medium text-sm hover:bg-cyan-50 transition-colors"
          >
            <span>Get verified</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden space-y-3">
        {/* Header row with ad info */}
        <div className="flex items-start gap-3">
          {/* Ad Icon */}
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
            <TrendingUp className="text-white" size={16} />
          </div>

          {/* Ad Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 mb-2">
              <h3 className="font-medium text-white wrap-break-word">Authentic MRR</h3>
              <div className="flex flex-wrap items-center gap-1">
                <span className="px-2 py-0.5 text-xs rounded-md font-medium bg-white/20 backdrop-blur-sm">
                  Revenue
                </span>
                <span className="px-2 py-0.5 text-xs rounded-md font-medium bg-white/20 backdrop-blur-sm">
                  Verified
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-100">
              <span>Verify revenue publicly</span>
              <span>Build trust</span>
            </div>
          </div>
        </div>

        {/* CTA Button - full width on mobile */}
        <div className="flex items-center pt-2 border-t border-white/20">
          <Link
            href="https://authenticmrr.com?ref=swiftconvert"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-cyan-600 rounded-lg font-medium text-xs hover:bg-cyan-50 transition-colors"
          >
            <span>Get verified</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}