import { ToolGrid } from "@/components/tool-grid";
import { tools } from "@/lib/tools";

export const metadata = {
  title: "Tools — Pacifica MCP",
  description: "32 MCP tools for AI agents to trade perpetuals on Pacifica. Market data, account monitoring, and live trading — all in one place.",
};

export default function ToolsPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Page header */}
      <div className="w-full bg-secondary border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            {tools.length} tools available
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-[0.9]">
            The tools.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            Market data tools are free and cached. Trading tools require a connected wallet and sign every request with your Ed25519 keypair.
          </p>
        </div>
      </div>

      {/* Tool grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full">
        <ToolGrid />
      </div>
    </main>
  );
}
