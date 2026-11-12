import { ArrowUpRight, Check, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameLevel } from "@/data/game-content";
import type { LevelStatus } from "@/data/game-progress";

const hueStyles = {
  cyan: { text: "text-hero-cyan", border: "border-hero-cyan/45", fill: "fill-hero-cyan", stroke: "stroke-hero-cyan" },
  coral: { text: "text-hero-coral", border: "border-hero-coral/45", fill: "fill-hero-coral", stroke: "stroke-hero-coral" },
  gold: { text: "text-hero-gold", border: "border-hero-gold/45", fill: "fill-hero-gold", stroke: "stroke-hero-gold" },
  mint: { text: "text-hero-mint", border: "border-hero-mint/45", fill: "fill-hero-mint", stroke: "stroke-hero-mint" },
};

export function HeroFigure({ level, compact = false }: { level: GameLevel; compact?: boolean }) {
  const hue = hueStyles[level.hue];
  return (
    <div className={`relative flex shrink-0 items-center justify-center ${compact ? "h-24 w-24" : "h-44 w-44 sm:h-52 sm:w-52"}`} aria-label={`${level.hero} hero emblem`}>
      <div className={`absolute inset-[8%] rounded-full border ${hue.border} opacity-70`} />
      <div className={`absolute inset-[16%] rounded-full border border-dashed ${hue.border} opacity-60`} />
      <svg viewBox="0 0 180 180" className={`hero-float relative h-full w-full ${hue.text}`} role="img" aria-hidden="true">
        <defs>
          <linearGradient id={`cape-${level.number}`} x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="currentColor" stopOpacity=".15" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".62" />
          </linearGradient>
        </defs>
        <path d="M57 61 27 137l34-13 27 28 27-28 36 13-29-76-32-15z" fill={`url(#cape-${level.number})`} stroke="currentColor" strokeOpacity=".8" strokeWidth="2" />
        <path d="M62 48q28-24 56 0l-7 47q-21 18-42 0z" fill="currentColor" fillOpacity=".28" stroke="currentColor" strokeWidth="2" />
        <path d="M68 68q22 9 44 0l-5 19q-17 9-34 0z" fill="currentColor" fillOpacity=".68" />
        <path d="M73 70h10m14 0h10" stroke="oklch(0.96 0.03 190)" strokeWidth="4" strokeLinecap="round" />
        <path d="m91 91-14 18 14 10 14-10z" fill="currentColor" stroke="currentColor" strokeWidth="2" />
        <circle cx="91" cy="107" r="6" fill="oklch(0.15 0.04 230)" />
        <path d="M44 136 56 95m72 41-12-41" stroke="currentColor" strokeOpacity=".9" strokeWidth="3" />
        <path d="M91 25v9m-63 58 9-3m109 0 9 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      </svg>
      <span className={`display-font absolute bottom-[23%] flex h-9 w-9 items-center justify-center rounded-full border border-current bg-background/85 text-lg font-bold shadow-lg ${hue.text}`} aria-hidden="true">{level.emblem}</span>
    </div>
  );
}

function StatusMark({ status }: { status: LevelStatus }) {
  if (status === "locked") return <LockKeyhole className="size-4" aria-hidden="true" />;
  if (status === "complete") return <Check className="size-4" aria-hidden="true" />;
  if (status === "in_progress") return <Sparkles className="size-4" aria-hidden="true" />;
  return <ArrowUpRight className="size-4" aria-hidden="true" />;
}

export function GridMap({
  statuses,
  badges,
  onSelect,
  arenaUnlocked,
}: {
  statuses: LevelStatus[];
  badges: number[];
  onSelect: (index: number) => void;
  arenaUnlocked: boolean;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[820px] overflow-hidden rounded-lg border border-border/70 bg-background/35 px-3 py-6 sm:px-8 sm:py-9" aria-label="Valuation Grid map">
      <div className="energy-grid grid-world absolute inset-0 opacity-70" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-80" viewBox="0 0 800 440" preserveAspectRatio="none" aria-hidden="true">
        <path d="M160 102 400 214 640 102M160 338 400 214 640 338M160 102 160 338M640 102 640 338" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-energy" strokeDasharray="7 8" />
        <circle cx="400" cy="214" r="82" fill="none" stroke="currentColor" strokeWidth="1" className="text-energy signal-pulse" />
        <circle cx="400" cy="214" r="112" fill="none" stroke="currentColor" strokeWidth="1" className="text-energy" strokeDasharray="2 9" />
      </svg>
      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1.2fr_1fr] sm:items-center sm:gap-x-7 sm:gap-y-5">
        {[0, 1, 2, 3].map((index) => {
          const level = levelsForMap[index];
          const status = statuses[index] ?? "locked";
          const hue = hueStyles[level.hue];
          const locked = status === "locked";
          return (
            <Button
              key={level.number}
              variant="ghost"
              disabled={locked}
              aria-label={`Mission ${level.number}: ${level.hero}, ${status.replace("_", " ")}`}
              onClick={() => onSelect(index)}
              className={`group relative flex h-auto min-h-32 flex-col items-start justify-between gap-3 overflow-hidden rounded-sm border bg-background/85 p-3 text-left transition-all hover:-translate-y-1 hover:bg-accent/80 sm:min-h-36 sm:p-4 ${hue.border} ${locked ? "opacity-45" : "opacity-100"} ${status === "complete" ? "shadow-[0_0_24px_color-mix(in_oklab,var(--hero-cyan)_12%,transparent)]" : ""}`}
            >
              <span className={`absolute -right-2 -top-5 font-display text-7xl font-bold opacity-[.09] ${hue.text}`}>0{level.number}</span>
              <span className={`flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-[.16em] ${hue.text}`}>
                <span>Sector 0{level.number}</span><StatusMark status={status} />
              </span>
              <span className="relative block">
                <span className="block text-sm font-semibold text-foreground sm:text-base">{level.hero}</span>
                <span className="mt-1 block text-[11px] capitalize text-muted-foreground">{status.replace("_", " ")}</span>
              </span>
            </Button>
          );
        })}
        <div className="col-span-2 flex min-h-28 flex-col items-center justify-center text-center sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:col-span-1">
          <div className="relative flex size-28 items-center justify-center rounded-full border border-energy/50 bg-background/90 shadow-[0_0_34px_color-mix(in_oklab,var(--energy)_16%,transparent)] sm:size-36">
            <div className="absolute inset-2 rounded-full border border-dashed border-energy/30" />
            <div className="text-center">
              <span className="display-font block text-[10px] font-semibold uppercase tracking-[.15em] text-energy">Valuation</span>
              <span className="display-font block text-base font-bold text-foreground sm:text-lg">CORE</span>
              <span className="mt-1 block text-[10px] text-muted-foreground">{badges.length}/4 sectors</span>
            </div>
          </div>
          <Button
            onClick={() => arenaUnlocked && onSelect(4)}
            disabled={!arenaUnlocked}
            variant="ghost"
            className={`mt-3 h-8 rounded-sm border px-3 text-[10px] font-semibold uppercase tracking-[.12em] ${arenaUnlocked ? "border-primary/60 text-primary" : "border-border text-muted-foreground"}`}
            aria-label={`Final Assessment Arena, ${arenaUnlocked ? "available" : "locked"}`}
          >
            {arenaUnlocked ? "Arena open" : "Arena locked"}
          </Button>
        </div>
      </div>
      <div className="relative mt-5 flex flex-wrap justify-center gap-2 border-t border-border/60 pt-4">
        {levelsForMap.map((level, index) => (
          <span key={level.number} className={`flex size-8 items-center justify-center rounded-full border text-xs ${badges.includes(index + 1) ? `${hueStyles[level.hue].border} ${hueStyles[level.hue].text} bg-background/90` : "border-border/70 text-muted-foreground/50"}`} aria-label={badges.includes(index + 1) ? `${level.hero} badge earned` : `${level.hero} badge unearned`}>
            {badges.includes(index + 1) ? level.emblem : "·"}
          </span>
        ))}
      </div>
    </div>
  );
}

const levelsForMap = [
  { number: 1, hero: "Comp Scout", hue: "cyan", emblem: "⌕" },
  { number: 2, hero: "Deal Shaper", hue: "coral", emblem: "⇄" },
  { number: 3, hero: "Multiple Master", hue: "gold", emblem: "×" },
  { number: 4, hero: "Source Guardian", hue: "mint", emblem: "▤" },
] as const;