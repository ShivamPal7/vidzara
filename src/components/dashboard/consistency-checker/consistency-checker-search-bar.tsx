"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchConsistencyChannels } from "@/actions/consistency-checker";
import type { ChannelSearchResult } from "./types";

interface ConsistencyCheckerSearchBarProps {
  onSelect: (channel: ChannelSearchResult) => void;
  loading?: boolean;
}

function formatSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function ConsistencyCheckerSearchBar({
  onSelect,
  loading = false,
}: ConsistencyCheckerSearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ChannelSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSelectedTitleRef = useRef("");

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch suggestions
  useEffect(() => {
    const queryStr = debouncedQuery.trim();
    if (!queryStr) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Abort if the query matches the last successfully selected channel title to prevent dropdown re-opening
    if (queryStr === lastSelectedTitleRef.current) {
      setResults([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    searchConsistencyChannels(queryStr).then((res) => {
      if (cancelled) return;
      setSearching(false);
      if (res.success && res.data) {
        setResults(res.data);
        setOpen(true);
      } else {
        setResults([]);
        setOpen(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (channel: ChannelSearchResult) => {
      lastSelectedTitleRef.current = channel.title;
      setQuery(channel.title);
      setOpen(false);
      setResults([]);
      onSelect(channel);
    },
    [onSelect]
  );

  const showDropdown = open && (searching || results.length > 0);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className="w-full relative"
    >
      {/* Search pill */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm px-5 h-14 transition-all duration-300",
          isFocused && "border-primary/50 shadow-[0_0_20px_-4px] shadow-primary/15"
        )}
      >
        {/* Icon / Spinner */}
        <div className="shrink-0 text-muted-foreground">
          {loading || searching ? (
            <IconLoader2 className="size-[18px] animate-spin text-primary" />
          ) : (
            <IconSearch className="size-[18px]" />
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            // Reset the selected ref if they typed something different
            if (e.target.value !== lastSelectedTitleRef.current) {
              lastSelectedTitleRef.current = "";
            }
            setQuery(e.target.value);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0 && query !== lastSelectedTitleRef.current) {
              setOpen(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search a YouTube channel..."
          disabled={loading}
          className="flex-1 min-w-0 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
        />

        {/* Loading pill */}
        {loading && (
          <span className="hidden sm:inline text-xs text-muted-foreground animate-pulse shrink-0">
            Fetching data…
          </span>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden"
          >
            {searching ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
                <IconLoader2 className="size-4 animate-spin" />
                Searching channels…
              </div>
            ) : (
              <ul className="py-1.5">
                {results.map((channel) => (
                  <li key={channel.channelId}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent input blur first
                        handleSelect(channel);
                      }}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={channel.thumbnailUrl} />
                          <AvatarFallback className="text-xs">
                            {channel.title.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {channel.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel.handle && `${channel.handle} · `}
                            {formatSubs(channel.subscriberCount)} subscribers
                          </p>
                        </div>
                      </div>
                      
                      <div className="shrink-0">
                        <div className="px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/20 text-primary bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                          Analyze
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
