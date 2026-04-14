import { Terminal, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    icon: Terminal,
    title: "Install",
    description: "One command. Zero config.",
    detail:
      "Run the install command and the Pacifica MCP server is immediately available in Claude, Cursor, or any MCP-compatible AI host.",
    code: "claude mcp add pacifica npx @pacifica/mcp",
  },
  {
    step: "02",
    icon: Wallet,
    title: "Connect Wallet",
    description: "Your wallet is auto-generated on first run.",
    detail:
      "The MCP server generates an Ed25519 keypair on first use. Fund your address with USDC on Solana (testnet or mainnet) to start trading.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Trade",
    description: "Ask your agent — it handles the rest.",
    detail:
      'Say "open a long on BTC-PERP at 10x leverage" and the agent will check prices, set leverage, and place the order — all in one shot.',
  },
];

export function SetupSteps() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3">
      {steps.map(({ step, icon: Icon, title, description, detail, code }, index) => (
        <div
          key={step}
          className={cn(
            "flex flex-col gap-5 py-8",
            index < 2 && "border-b border-border sm:border-b-0",
            index > 0 && "sm:border-l sm:border-border sm:pl-10",
            index < 2 && "sm:pr-10",
          )}
        >
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-muted-foreground/40 tracking-widest select-none">
              {step}
            </span>
            <div className="size-9 flex items-center justify-center rounded-xl bg-background text-primary border border-border shadow-sm">
              <Icon className="size-4" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              {title}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground leading-snug">
              {description}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground/70">
            {detail}
          </p>

          {code && (
            <code className="font-mono text-xs text-primary/80 bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg break-all">
              {code}
            </code>
          )}
        </div>
      ))}
    </div>
  );
}
