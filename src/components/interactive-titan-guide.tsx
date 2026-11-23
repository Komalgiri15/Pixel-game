import React, { useState } from "react";
import { levels } from "@/data/game-content";

interface StepGuide {
  num: string;
  badgeNum: number;
  label: string;
  subtitle: string;
  details: string;
  titanName: string;
  titanRole: string;
  avatarImg: string;
  accentColor: string; // teal, coral, peach
  borderColor: string;
  speechBg: string;
  glowColor: string;
}

const GUIDE_STEPS: StepGuide[] = [
  {
    num: "01",
    badgeNum: 1,
    label: "WATCH",
    subtitle: "Video briefings per sector",
    details: "Watch field briefings led by Comp Scout to identify comparable universes & control premiums.",
    titanName: "Comp Scout",
    titanRole: "Valuation Comps Specialist",
    avatarImg: "/avatars/comp_scout_full.png",
    accentColor: "#60e1d5",
    borderColor: "border-[#60e1d5]",
    speechBg: "bg-gradient-to-r from-[#034a52] to-[#02373d]",
    glowColor: "rgba(96,225,213,0.35)",
  },
  {
    num: "02",
    badgeNum: 2,
    label: "ANSWER",
    subtitle: "Knowledge challenges",
    details: "Solve tactical M&A questions alongside Deal Shaper. Distinguish offer values and deal structures.",
    titanName: "Deal Shaper",
    titanRole: "Deal Consideration Titan",
    avatarImg: "/avatars/deal_shaper_full.png",
    accentColor: "#ff6164",
    borderColor: "border-[#ff6164]",
    speechBg: "bg-gradient-to-r from-[#034a52] to-[#02373d]",
    glowColor: "rgba(255,97,100,0.35)",
  },
  {
    num: "03",
    badgeNum: 3,
    label: "POWER UP",
    subtitle: "Earn sector power badges",
    details: "Master LTM calculations & multiples ranges with Multiple Master to forge your valuation badge.",
    titanName: "Multiple Master",
    titanRole: "Multiples & Metrics Guru",
    avatarImg: "/avatars/multiple_master_full.png",
    accentColor: "#ffac88",
    borderColor: "border-[#ffac88]",
    speechBg: "bg-gradient-to-r from-[#034a52] to-[#02373d]",
    glowColor: "rgba(255,172,136,0.35)",
  },
  {
    num: "04",
    badgeNum: 4,
    label: "ARENA",
    subtitle: "Unlock Final Mastery",
    details: "Join Source Guardian to authenticate filing sources, connect all 4 sectors, and claim your Certificate!",
    titanName: "Source Guardian",
    titanRole: "Filing & Source Protector",
    avatarImg: "/avatars/source_guardian_full.png",
    accentColor: "#60e1d5",
    borderColor: "border-[#60e1d5]",
    speechBg: "bg-gradient-to-r from-[#034a52] to-[#02373d]",
    glowColor: "rgba(96,225,213,0.35)",
  },
];

/**
 * Interactive Game Guide Comic / Tutorial Strip
 * Inspired by mobile game dialogue tutorials (like Cookie Run Kingdom / RPGs):
 * Features the Titan avatars standing with character speech bubbles and interactive step cards.
 */
export function InteractiveTitanGuide({
  onSelectSector,
}: {
  onSelectSector?: (index: number) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const current = GUIDE_STEPS[activeStep] ?? GUIDE_STEPS[0]!;

  return (
    <div className="relative rounded-3xl border-2 border-[#00959a] bg-gradient-to-b from-[#02373d]/95 via-[#034a52]/90 to-[#02373d]/95 p-5 sm:p-7 shadow-[0_15px_45px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Background cyber grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00959a]/15 via-transparent to-transparent pointer-events-none" />

      {/* Top Title Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#00959a]/30 pb-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[.22em] text-[#60e1d5]">
            <span className="size-2 rounded-full bg-[#60e1d5] animate-ping" />
            Tactical Mission Briefing · Commander Guide
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white mt-1">
            About Transaction Titans
          </h2>
          <p className="text-xs sm:text-sm text-[#defcf9]/80 max-w-2xl mt-1">
            Restore the Valuation Grid through 4 tactical finance sectors. Deploy into each sector, watch the video briefing, master the concepts, and pass each knowledge check to unlock the Final Assessment Arena!
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
          {GUIDE_STEPS.map((s, idx) => {
            const isActive = idx === activeStep;
            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(idx)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "border-white bg-[#00959a] text-white scale-105 shadow-[0_0_15px_rgba(96,225,213,0.4)]"
                    : "border-[#034a52] bg-[#02373d] text-[#defcf9]/60 hover:text-white hover:border-[#00959a]"
                }`}
              >
                <span>{s.num}</span>
                <span className="hidden md:inline font-sans">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Showcase Dialogue Box (Character on Left, Speech Bubble on Right with pointer) */}
      <div className="relative z-10 grid md:grid-cols-[220px_1fr] items-center gap-6 sm:gap-8 bg-[#02373d]/70 rounded-2xl border border-[#00959a]/40 p-4 sm:p-6 mb-6">
        {/* Left: Full-Body Titan Avatar with Pedestal Glow */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Circular Stage / Hologram Base */}
          <div
            className="absolute bottom-2 size-40 rounded-full blur-xl pointer-events-none transition-all duration-500"
            style={{ backgroundColor: current.glowColor }}
          />
          <div className="relative h-56 sm:h-64 w-44 flex items-center justify-center animate-in zoom-in-95 duration-300">
            <img
              src={current.avatarImg}
              alt={current.titanName}
              className="relative h-full w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
            />
          </div>

          {/* Titan Badge */}
          <div className="mt-2 text-center">
            <span
              className="text-[10px] font-mono font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-[#02373d]"
              style={{ color: current.accentColor, borderColor: current.accentColor }}
            >
              {current.titanName}
            </span>
            <span className="block text-[11px] text-[#defcf9]/70 mt-1 font-semibold">
              {current.titanRole}
            </span>
          </div>
        </div>

        {/* Right: RPG Speech Bubble with Comic Tail & Gesture Cue */}
        <div className="relative">
          {/* Speech Bubble Card */}
          <div
            className={`relative rounded-2xl border-2 p-5 sm:p-6 shadow-2xl transition-all duration-300 ${current.borderColor} ${current.speechBg}`}
          >
            {/* Comic Speech Pointer Tail (pointing towards avatar on md screens) */}
            <div
              className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-[12px]"
              style={{ borderRightColor: current.accentColor }}
            />

            {/* Bubble Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                {/* Round Step Number Badge */}
                <div
                  className="size-8 rounded-xl flex items-center justify-center text-sm font-extrabold text-[#02373d] shadow-md"
                  style={{ backgroundColor: current.accentColor }}
                >
                  {current.badgeNum}
                </div>
                <div>
                  <span
                    className="text-xs font-mono font-bold uppercase tracking-wider block"
                    style={{ color: current.accentColor }}
                  >
                    STEP {current.num} · {current.label}
                  </span>
                  <h3 className="font-display font-extrabold text-white text-lg sm:text-xl">
                    {current.subtitle}
                  </h3>
                </div>
              </div>

              {/* Hand Pointer Cue */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#02373d]/80 border border-white/20 text-white">
                <span className="text-base animate-bounce">👆</span>
                <span className="text-[#defcf9]">Mission Step</span>
              </div>
            </div>

            {/* Dialogue / Instructional Text */}
            <p className="text-sm sm:text-base text-[#defcf9] leading-relaxed font-medium">
              "{current.details}"
            </p>

            {/* Bottom Actions inside speech bubble */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setActiveStep(
                      (prev) => (prev - 1 + GUIDE_STEPS.length) % GUIDE_STEPS.length
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-[#00959a] bg-[#02373d] text-white text-xs font-bold hover:bg-[#00959a] transition-colors"
                >
                  ← Prev Step
                </button>
                <button
                  onClick={() =>
                    setActiveStep((prev) => (prev + 1) % GUIDE_STEPS.length)
                  }
                  className="px-3 py-1.5 rounded-lg border border-[#00959a] bg-[#02373d] text-white text-xs font-bold hover:bg-[#00959a] transition-colors"
                >
                  Next Step →
                </button>
              </div>

              {onSelectSector && (
                <button
                  onClick={() => onSelectSector(activeStep)}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#02373d] hover:brightness-110 shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                  style={{ backgroundColor: current.accentColor }}
                >
                  <span>Deploy to Sector 0{activeStep + 1}</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive Clickable Step Cards Below */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {GUIDE_STEPS.map((step, idx) => {
          const isSelected = idx === activeStep;
          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden group ${
                isSelected
                  ? "border-white bg-[#034a52] shadow-xl scale-[1.02]"
                  : "border-[#00959a]/30 bg-[#02373d]/80 hover:border-[#00959a] hover:bg-[#034a52]/60"
              }`}
            >
              {/* Top Row: Mini Avatar thumbnail + Number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: isSelected ? step.accentColor : "#02373d",
                    color: isSelected ? "#02373d" : step.accentColor,
                  }}
                >
                  {step.num} · {step.label}
                </span>

                <div className="size-8 rounded-full overflow-hidden border border-white/20 bg-[#02373d] shrink-0">
                  <img
                    src={step.avatarImg}
                    alt={step.titanName}
                    className="size-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Title */}
              <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                {step.subtitle}
              </h4>
              <p className="text-[10px] text-[#defcf9]/60 line-clamp-1 mt-0.5">
                {step.titanName}
              </p>

              {/* Active Indicator Arrow */}
              {isSelected && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: step.accentColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
