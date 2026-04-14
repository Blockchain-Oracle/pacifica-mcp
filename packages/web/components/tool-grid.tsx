"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BlurFade } from "@/components/ui/blur-fade";
import { ToolCard } from "@/components/tool-card";
import { cn } from "@/lib/utils";
import { tools, categoryLabel, categoryDescription } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";

type FilterTab = ToolCategory | "all";

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "market-data", label: "Market Data" },
  { value: "account", label: "Account" },
  { value: "trading", label: "Trading" },
  { value: "system", label: "System" },
];

export function ToolGrid() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return tools.filter((tool) => {
      const matchesCategory =
        activeTab === "all" ? true : tool.category === activeTab;
      const matchesQuery =
        q === "" ||
        tool.name.toLowerCase().includes(q) ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.prompt.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeTab]);

  // Group by category for the "all" view
  const grouped = useMemo(() => {
    if (activeTab !== "all" || query.trim() !== "") return null;
    const groups: Partial<Record<ToolCategory, typeof tools>> = {};
    for (const tool of filtered) {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category]!.push(tool);
    }
    return groups;
  }, [filtered, activeTab, query]);

  const categoryOrder: ToolCategory[] = ["market-data", "account", "trading", "system"];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Search + filter pills */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tools or example prompts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 h-11 text-sm rounded-xl border-border bg-card focus:ring-1 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setActiveTab(value); }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-mono font-medium transition-colors",
                activeTab === value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              )}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto font-mono text-xs text-muted-foreground self-center">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grouped view (all + no query) */}
      {grouped ? (
        <div className="flex flex-col gap-10">
          {categoryOrder.map((cat) => {
            const group = grouped[cat];
            if (!group || group.length === 0) return null;
            return (
              <div key={cat} className="flex flex-col gap-4">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-sm font-bold text-foreground tracking-tight">
                    {categoryLabel[cat]}
                  </h3>
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
                    {categoryDescription[cat]}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.map((tool, i) => (
                    <BlurFade key={tool.name} delay={0.03 * i} inView>
                      <ToolCard tool={tool} />
                    </BlurFade>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat filtered view */
        <div className="flex flex-col gap-3">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((tool, i) => (
                <BlurFade key={tool.name} delay={0.03 * i} inView>
                  <ToolCard tool={tool} />
                </BlurFade>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-16">
              No tools match your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
