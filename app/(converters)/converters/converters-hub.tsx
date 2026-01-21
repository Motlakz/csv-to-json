"use client"

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, ChevronDown, Home, FileText, Share2 } from 'lucide-react';
import {
  getAllConverters,
  categories,
  ConverterCategory,
  ConverterConfig
} from '@/lib/converters/registry';
import { MRRLeaderboardPromoCard } from '@/components/common/mrr-leaderboard-promo';
import { LoveTestPromoCard } from '@/components/common/love-test-promo-card';
import { AdPlaceholder } from '@/components/common/ad-placeholder';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/common/theme-toggle';

const ITEMS_PER_PAGE = 9;
const AD_INTERVAL = 6; // Show ad every 6 items

export function ConvertersHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ConverterCategory | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const allConverters = getAllConverters();

  // Filter converters based on search and category
  const filteredConverters = useMemo(() => {
    return allConverters.filter((converter) => {
      const matchesSearch = searchQuery === '' ||
        converter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        converter.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        converter.sourceFormat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        converter.targetFormat.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || converter.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allConverters, searchQuery, selectedCategory]);

  // Get visible converters with pagination
  const visibleConverters = filteredConverters.slice(0, visibleCount);
  const hasMore = visibleCount < filteredConverters.length;

  // Insert ads into the converter list
  const convertersWithAds = useMemo(() => {
    const items: (ConverterConfig | { type: 'ad'; variant: number })[] = [];
    visibleConverters.forEach((converter, index) => {
      items.push(converter);
      // Insert ad after every AD_INTERVAL items
      if ((index + 1) % AD_INTERVAL === 0 && index < visibleConverters.length - 1) {
        items.push({ type: 'ad', variant: Math.floor(index / AD_INTERVAL) % 3 });
      }
    });
    return items;
  }, [visibleConverters]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const categoryList = Object.values(categories);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:block md:w-64 min-h-screen md:sticky md:top-0 border-r relative bg-white dark:bg-gray-900">
          <div className="p-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="p-1 rounded-xl flex items-center justify-center">
                <Image src="/logo.png" alt="Swift Convert" width={48} height={48} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Swift Convert
              </span>
            </Link>

            {/* Main Navigation */}
            <nav className="space-y-1 mb-6">
              <Link href="/converters">
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 font-medium"
                >
                  <Home size={20} />
                  All Converters
                </motion.div>
              </Link>

              <Link href="/all-files">
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  <FileText size={20} />
                  All Files
                </motion.div>
              </Link>

              <Link href="/shared-files">
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  <Share2 size={20} />
                  Shared Files
                </motion.div>
              </Link>
            </nav>

            <Separator className="my-4" />

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
                Categories
              </h3>
              <div className="space-y-1">
                {categoryList.map((category) => {
                  const Icon = category.icon;
                  const count = allConverters.filter(c => c.category === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors",
                        selectedCategory === category.id
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <Icon size={16} />
                      <span>{category.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Promo Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
            <MRRLeaderboardPromoCard />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    All Converters
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredConverters.length} converters available
                  </p>
                </div>

                <ThemeToggle />

                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search converters..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Mobile Category Tabs */}
              <div className="md:hidden mt-4 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    selectedCategory === 'all'
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  )}
                >
                  All
                </button>
                {categoryList.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                    className={cn(
                      "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Converters Grid */}
          <main className="max-w-7xl mx-auto px-4 py-6">
            {filteredConverters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No converters found matching your search.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {convertersWithAds.map((item, index) => {
                      if ('type' in item && item.type === 'ad') {
                        return (
                          <motion.div
                            key={`ad-${index}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="col-span-1"
                          >
                            <InlineAd variant={item.variant} />
                          </motion.div>
                        );
                      }

                      const converter = item as ConverterConfig;
                      return (
                        <ConverterCard key={converter.id} converter={converter} />
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMore}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Load More
                      <ChevronDown size={18} />
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Showing {visibleConverters.length} of {filteredConverters.length} converters
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400">
        <div className="max-w-7xl px-4 sm:px-6 py-6 mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-center sm:text-left">© {new Date().getFullYear()} Swift Convert.</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">Fast</span>
            <span className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">Secure</span>
            <span className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">Privacy-first</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Converter Card Component
function ConverterCard({ converter }: { converter: ConverterConfig }) {
  const Icon = converter.icon;

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600',
    violet: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600',
    rose: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600',
    slate: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    orange: 'text-orange-600 dark:text-orange-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    violet: 'text-violet-600 dark:text-violet-400',
    rose: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    slate: 'text-slate-600 dark:text-slate-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Link href={converter.isActive ? `/${converter.slug}` : '#'}>
        <div className={cn(
          "h-full p-4 rounded-xl border transition-all duration-200",
          colorClasses[converter.colorScheme],
          !converter.isActive && "opacity-60 cursor-not-allowed"
        )}>
          <div className="flex items-start justify-between mb-3">
            <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-800", iconColorClasses[converter.colorScheme])}>
              <Icon size={20} />
            </div>
            {!converter.isActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                Coming Soon
              </span>
            )}
            {converter.popular && converter.isActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium">
                Popular
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {converter.shortName}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {converter.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {converter.features.slice(0, 2).map((feature, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400"
              >
                {feature}
              </span>
            ))}
          </div>

          {converter.isActive && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", iconColorClasses[converter.colorScheme])}>
              Convert Now
              <ArrowRight size={14} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// Inline Ad Component
function InlineAd({ variant }: { variant: number }) {
  switch (variant % 3) {
    case 0:
      return <LoveTestPromoCard />;
    case 1:
      return <MRRLeaderboardPromoCard />;
    default:
      return <AdPlaceholder variant="compact" />;
  }
}
