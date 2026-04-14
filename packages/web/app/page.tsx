"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, GitFork } from "lucide-react";
import { McpInstall, SkillInstall } from "@/components/install-command";
import { SetupSteps } from "@/components/setup-steps";
import { ToolCard } from "@/components/tool-card";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/tools";

// Featured tools — 6 handpicked across categories
const FEATURED_TOOLS = [
  "pacifica-prices",
  "pacifica-orderbook",
  "pacifica-candles",
  "pacifica-positions",
  "pacifica-market-order",
  "pacifica-set-tpsl",
].map((name) => tools.find((t) => t.name === name)!).filter(Boolean);

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">

      {/* ══════════════════════════════════════════
          HERO
          ══════════════════════════════════════════ */}
      <section className="relative w-full bg-background overflow-hidden">
        {/* Grid dot background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.78 0.14 200 / 0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Teal radial glow — shifted left for two-column layout */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-start">
          <div className="ml-[10%] w-[500px] h-[320px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-20">
          {/* Two-column grid on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left column ── */}
            <div className="flex flex-col gap-6">
              <BlurFade delay={0}>
                <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  Pacifica Perpetuals · MCP Server
                </span>
              </BlurFade>

              <BlurFade delay={0.06}>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tighter leading-[0.92] text-foreground">
                  Give AI agents the power to{" "}
                  <span className="text-primary">trade perpetuals</span>
                </h1>
              </BlurFade>

              <BlurFade delay={0.12}>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  32 tools. Market data, positions, and live trading — for Claude, Cursor, and any MCP host.
                </p>
              </BlurFade>

              <BlurFade delay={0.18} className="w-full">
                <McpInstall />
              </BlurFade>

              <BlurFade delay={0.22}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/tools">
                    <Button className="rounded-full px-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      Explore Tools
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button
                      variant="outline"
                      className="rounded-full px-6 border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                    >
                      How It Works
                    </Button>
                  </a>
                </div>
              </BlurFade>
            </div>

            {/* ── Right column: terminal preview + stats ── */}
            <BlurFade delay={0.28}>
              <div className="flex flex-col gap-4">
                {/* Terminal window */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  {/* Terminal title bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    <span className="size-2.5 rounded-full bg-red-400/70" />
                    <span className="size-2.5 rounded-full bg-yellow-400/70" />
                    <span className="size-2.5 rounded-full bg-green-400/70" />
                    <span className="ml-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      Claude · Pacifica MCP
                    </span>
                  </div>
                  {/* Terminal body */}
                  <div className="px-5 py-5 font-mono text-[13px] space-y-3">
                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">›</span>
                      <span className="text-foreground">What&apos;s the BTC price and funding rate?</span>
                    </div>
                    <div className="flex gap-2 text-muted-foreground">
                      <span className="text-primary/60 shrink-0">✓</span>
                      <span>
                        <span className="text-foreground font-semibold">$74,586</span>
                        {" · "}
                        <span className="text-green-400">+0.8% 24h</span>
                        {" · "}
                        funding <span className="text-primary">+0.0015%</span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">›</span>
                      <span className="text-foreground">Open a 0.1 BTC long at market</span>
                    </div>
                    <div className="flex gap-2 text-muted-foreground">
                      <span className="text-primary/60 shrink-0">✓</span>
                      <span>
                        Position opened · size <span className="text-foreground font-semibold">0.1 BTC</span> · entry <span className="text-foreground font-semibold">$74,592</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary shrink-0">›</span>
                      <span className="text-muted-foreground/60 animate-pulse">_</span>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Tools", value: "32" },
                    { label: "Categories", value: "4" },
                    { label: "Auth", value: "None" },
                    { label: "Install", value: "1 cmd" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-border bg-card/50 px-3 py-3 flex flex-col items-center gap-0.5"
                    >
                      <span className="text-xl font-bold text-foreground tracking-tight">
                        {value}
                      </span>
                      <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="w-full bg-secondary border-y border-border"
      >
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              How it works
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              Three steps to start trading.
            </h2>
          </div>
          <SetupSteps />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INSTALL — MCP + SKILL SIDE BY SIDE
          ══════════════════════════════════════════ */}
      <section className="w-full bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Install
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              One command, everywhere.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl">
              Install the MCP server for direct tool access, or add the Agent Skill so your AI knows when and how to use it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 flex flex-col">
              <McpInstall />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 flex flex-col">
              <SkillInstall />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED TOOLS PREVIEW
          ══════════════════════════════════════════ */}
      <section className="w-full bg-secondary border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                Featured tools
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Built for trading.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-xl">
                Click any card to copy an example prompt you can paste directly into Claude. Market data is free — trading requires a wallet.
              </p>
            </div>
            <Link
              href="/tools"
              className="shrink-0 inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              View all 32
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURED_TOOLS.map((tool, i) => (
              <BlurFade key={tool.name} delay={0.04 * i} inView>
                <ToolCard tool={tool} />
              </BlurFade>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/tools">
              <Button
                variant="outline"
                className="rounded-full px-7 gap-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              >
                View all 32 tools
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════ */}
      <footer className="w-full bg-background border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-mono text-xs font-bold text-foreground tracking-tight">
              Pacifica MCP
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Trade perpetuals with AI agents
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/tools"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Tools
            </Link>
            <Link
              href="/skill"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skill
            </Link>
            <Link
              href="https://pacifica.gitbook.io/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs <ExternalLink className="size-3" />
            </Link>
            <Link
              href="https://github.com/Blockchain-Oracle/pacifica-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub <GitFork className="size-3" />
            </Link>
            <Link
              href="https://pacifica.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Pacifica.fi <ExternalLink className="size-3" />
            </Link>
            <Link
              href="https://test.pacifica.fi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Testnet <ExternalLink className="size-3" />
            </Link>
          </nav>
        </div>
      </footer>

    </main>
  );
}
