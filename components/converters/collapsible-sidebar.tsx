/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Share2, ChevronDown, Star, Clock, Layers } from 'lucide-react';
import {
  categories,
  getConvertersByCategory,
  getCategoryForConverter,
  ConverterCategory,
  ConverterConfig
} from '@/lib/converters/registry';
import { MRRLeaderboardPromoCard } from '@/components/common/mrr-leaderboard-promo';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface CollapsibleSidebarProps {
  showFileCounts?: boolean;
}

// Store keys for favorites and recents
const FAVORITES_KEY = 'converter-favorites';
const RECENTS_KEY = 'converter-recents';
const MAX_RECENTS = 5;

export function CollapsibleSidebar({ showFileCounts = true }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<ConverterCategory>>(new Set());
  const [manuallyCollapsed, setManuallyCollapsed] = useState<Set<ConverterCategory>>(new Set());
  const categoryRefs = useRef<Record<ConverterCategory, HTMLDivElement | null>>({} as any);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error parsing favorites:', e);
      return [];
    }
  });
  const [recents, setRecents] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error parsing recents:', e);
      return [];
    }
  });

  // Get current converter slug from pathname
  const currentSlug = pathname.replace('/', '');
  const currentCategory = getCategoryForConverter(currentSlug);

  // Load favorites and recents from localStorage
  
  // No effect to mutate expansion; initial auto-expansion is derived in render until user interacts

  useEffect(() => {
    if (currentSlug && getCategoryForConverter(currentSlug)) {
      try {
        const raw = localStorage.getItem(RECENTS_KEY);
        const prev: string[] = raw ? JSON.parse(raw) : [];
        const filtered = prev.filter((slug) => slug !== currentSlug);
        const updated = [currentSlug, ...filtered].slice(0, MAX_RECENTS);
        localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('recents-updated'));
      } catch {
        // noop
      }
    }
  }, [currentSlug]);

  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem(RECENTS_KEY);
        const next = raw ? JSON.parse(raw) : [];
        setRecents(next);
      } catch {
        // noop
      }
    };
    window.addEventListener('recents-updated', handler as EventListener);
    window.addEventListener('storage', handler as EventListener);
    return () => {
      window.removeEventListener('recents-updated', handler as EventListener);
      window.removeEventListener('storage', handler as EventListener);
    };
  }, []);

  const toggleCategory = (category: ConverterCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
        setManuallyCollapsed((mc) => new Set([...mc, category]));
      } else {
        next.add(category);
        setManuallyCollapsed((mc) => {
          const copy = new Set(mc);
          copy.delete(category);
          return copy;
        });
        const el = categoryRefs.current[category];
        if (el) {
          requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (!currentCategory) return;
    const isAutoExpanded = !manuallyCollapsed.has(currentCategory);
    if (isAutoExpanded) {
      const el = categoryRefs.current[currentCategory];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentCategory, manuallyCollapsed]);

  const toggleFavorite = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(slug)
        ? prev.filter((f) => f !== slug)
        : [...prev, slug];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const categoryList = Object.values(categories);

  return (
    <aside className="hidden md:flex md:w-64 min-h-screen md:sticky md:top-0 border-r bg-white dark:bg-gray-900 flex-col">
      <div className="flex-1 overflow-y-auto p-4">
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
        <nav className="space-y-1 mb-4">
          <Link href="/converters">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                pathname === '/converters'
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Layers size={20} />
              All Converters
            </motion.div>
          </Link>

          <Link href="/all-files">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                pathname === '/all-files'
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <FileText size={20} />
              All Files
              {showFileCounts && <FileCountBadge page="all" />}
            </motion.div>
          </Link>

          <Link href="/shared-files">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                pathname === '/shared-files'
                  ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Share2 size={20} />
              Shared Files
              {showFileCounts && <FileCountBadge page="shared" />}
            </motion.div>
          </Link>
        </nav>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 flex items-center gap-2">
                <Star size={12} />
                Favorites
              </h3>
              <div className="space-y-0.5">
                {favorites.map((slug) => {
                  const converters = Object.values(categories).flatMap(cat =>
                    getConvertersByCategory(cat.id)
                  );
                  const converter = converters.find(c => c.slug === slug);
                  if (!converter) return null;
                  return (
                    <ConverterNavItem
                      key={slug}
                      converter={converter}
                      isActive={currentSlug === slug}
                      isFavorite={true}
                      onToggleFavorite={(e) => toggleFavorite(slug, e)}
                      compact
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Recent Converters */}
        {recents.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 flex items-center gap-2">
                <Clock size={12} />
                Recent
              </h3>
              <div className="space-y-0.5">
                {recents.slice(0, 3).map((slug) => {
                  const converters = Object.values(categories).flatMap(cat =>
                    getConvertersByCategory(cat.id)
                  );
                  const converter = converters.find(c => c.slug === slug);
                  if (!converter || favorites.includes(slug)) return null;
                  return (
                    <ConverterNavItem
                      key={slug}
                      converter={converter}
                      isActive={currentSlug === slug}
                      isFavorite={false}
                      onToggleFavorite={(e) => toggleFavorite(slug, e)}
                      compact
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* Collapsible Categories */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1 mb-2">
            Categories
          </h3>

          {categoryList.map((category) => {
            const converters = getConvertersByCategory(category.id);
            const isExpanded =
              expandedCategories.has(category.id) ||
              (currentCategory === category.id && !manuallyCollapsed.has(category.id));
            const Icon = category.icon;
            const hasActiveConverter = converters.some(c => c.slug === currentSlug);

            return (
              <div key={category.id} ref={(el) => { categoryRefs.current[category.id] = el; }}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    hasActiveConverter
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-left">{category.name}</span>
                  <span className="text-xs text-gray-400 mr-1">{converters.length}</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform text-gray-400",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 dark:border-gray-700 pl-2">
                        {converters.map((converter) => (
                          <ConverterNavItem
                            key={converter.slug}
                            converter={converter}
                            isActive={currentSlug === converter.slug}
                            isFavorite={favorites.includes(converter.slug)}
                            onToggleFavorite={(e) => toggleFavorite(converter.slug, e)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promo Section - Fixed at bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <MRRLeaderboardPromoCard />
      </div>
    </aside>
  );
}

// Converter Nav Item
interface ConverterNavItemProps {
  converter: ConverterConfig;
  isActive: boolean;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  compact?: boolean;
}

function ConverterNavItem({ converter, isActive, isFavorite, onToggleFavorite, compact }: ConverterNavItemProps) {
  const Icon = converter.icon;

  return (
    <Link href={converter.isActive ? `/${converter.slug}` : '#'}>
      <motion.div
        whileHover={{ x: 2 }}
        className={cn(
          "group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
          isActive
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white",
          !converter.isActive && "opacity-50 cursor-not-allowed"
        )}
      >
        {!compact && <Icon size={14} />}
        <span className="flex-1 truncate">{converter.shortName}</span>
        {!converter.isActive && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500">
            Soon
          </span>
        )}
        <button
          onClick={onToggleFavorite}
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
            isFavorite && "opacity-100 text-yellow-500"
          )}
        >
          <Star size={12} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </motion.div>
    </Link>
  );
}

// File Count Badge
function FileCountBadge({ page }: { page: 'all' | 'shared' }) {
  const [count, setCount] = useState<number>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('converter-storage') : null;
      if (!stored) return 0;
      const data = JSON.parse(stored);
      const history = data.state?.history || [];
      return page === 'shared' ? history.filter((item: any) => item.isShared).length : history.length;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const recalc = () => {
      try {
        const stored = localStorage.getItem('converter-storage');
        if (!stored) {
          setCount(0);
          return;
        }
        const data = JSON.parse(stored);
        const history = data.state?.history || [];
        const filteredCount = page === 'shared' ? history.filter((item: any) => item.isShared).length : history.length;
        setCount(filteredCount);
      } catch (error) {
        console.error('Error reading storage:', error);
      }
    };
    window.addEventListener('storage', recalc);
    window.addEventListener('converter-storage-updated', recalc as EventListener);
    return () => {
      window.removeEventListener('storage', recalc);
      window.removeEventListener('converter-storage-updated', recalc as EventListener);
    };
  }, [page]);

  if (count === 0) return null;

  return (
    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
      {count}
    </span>
  );
}
