"use client";

import { useState } from "react";
import { Check, BarChart2, User, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool, ToolCategory } from "@/lib/tools";

const categoryIcon: Record<ToolCategory, React.ReactNode> = {
  "market-data": <BarChart2 className="size-3.5" />,
  account: <User className="size-3.5" />,
  trading: <TrendingUp className="size-3.5" />,
  system: <Settings className="size-3.5" />,
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tool.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback for non-secure contexts
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy example prompt: ${tool.title}`}
      className={cn(
        "group w-full text-left flex items-start gap-3.5 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer",
        copied
          ? "border-primary/50 bg-primary/5"
          : "border-border/70 bg-card hover:border-primary/30 hover:bg-card/80 active:scale-[0.99]"
      )}
    >
      {/* Category icon */}
      <div className={cn(
        "size-8 shrink-0 flex items-center justify-center rounded-lg border transition-colors",
        copied
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-muted border-border/60 text-muted-foreground group-hover:text-primary group-hover:border-primary/30"
      )}>
        {categoryIcon[tool.category]}
      </div>

      {/* Text block */}
      <div className="flex-1 min-w-0">
        {/* Row 1: name + wallet badge */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground truncate tracking-tight">
            {tool.title}
          </span>
          {tool.requiresWallet ? (
            <span className="font-mono text-[9px] font-bold text-amber-500/80 uppercase tracking-wider shrink-0 border border-amber-500/30 rounded px-1.5 py-0.5">
              Wallet
            </span>
          ) : (
            <span className="font-mono text-[9px] font-bold text-primary/70 uppercase tracking-wider shrink-0">
              Free
            </span>
          )}
        </div>

        {/* Row 2: description */}
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>

        {/* Row 3: example prompt (shown on hover) */}
        <p className={cn(
          "text-xs font-mono mt-1.5 truncate transition-all duration-200",
          copied
            ? "text-primary"
            : "text-muted-foreground/50 group-hover:text-muted-foreground/70"
        )}>
          &ldquo;{tool.prompt}&rdquo;
        </p>
      </div>

      {/* Copy check */}
      <div className={cn(
        "shrink-0 size-5 flex items-center justify-center rounded-md transition-all duration-200 mt-0.5",
        copied
          ? "opacity-100 text-primary"
          : "opacity-0 group-hover:opacity-60 text-muted-foreground"
      )}>
        <Check className="size-3.5" />
      </div>
    </button>
  );
}
