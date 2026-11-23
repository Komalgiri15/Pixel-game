import React, { useState, useEffect } from "react";
import {
  PointGestureSvg,
  ThumbsUpGestureSvg,
  WaveGestureSvg,
  VictoryGestureSvg,
} from "./gesture-animations";

export interface GestureStep {
  id: number;
  badge: string;
  name: string;
  keyLabel: string;
  action: string;
  desc: string;
  color: "teal" | "coral" | "peach";
  renderSvg: (className?: string) => React.ReactNode;
}

export const GESTURE_STEPS: GestureStep[] = [
  {
    id: 1,
    badge: "1",
    name: "Point / Index Finger",
    keyLabel: "Keys 1, 2, 3, 4",
    action: "Select Option [A, B, C, D]",
    desc: "Point your index finger up toward the choice to highlight and select it.",
    color: "teal",
    renderSvg: (cls) => <PointGestureSvg className={cls ?? "size-20"} />,
  },
  {
    id: 2,
    badge: "✓",
    name: "Thumbs Up",
    keyLabel: "Enter Key",
    action: "Confirm & Submit Answer",
    desc: "Flash a clear thumbs-up gesture to lock in your answer.",
    color: "coral",
    renderSvg: (cls) => <ThumbsUpGestureSvg className={cls ?? "size-20"} />,
  },
  {
    id: 3,
    badge: "3",
    name: "Open Palm / Wave",
    keyLabel: "Space Key",
    action: "Advance to Next Challenge",
    desc: "Wave open palm sideways to progress to the next mission question.",
    color: "teal",
    renderSvg: (cls) => <WaveGestureSvg className={cls ?? "size-20"} />,
  },
  {
    id: 4,
    badge: "▶ ⏸",
    name: "Victory / Peace Sign",
    keyLabel: "Key [P]",
    action: "Toggle Video Play / Pause",
    desc: "Hold up two fingers to pause or resume the tactical briefing video.",
    color: "peach",
    renderSvg: (cls) => <VictoryGestureSvg className={cls ?? "size-20"} />,
  },
];

/**
 * An auto-cycling interactive gesture card that shows gestures ONE BY ONE automatically.
 * Includes progress indicator bars, auto-rotation timer, and manual pause/next controls.
 */
export function AutoGestureShowcase({
  autoAdvanceMs = 3500,
  className = "",
}: {
  autoAdvanceMs?: number;
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GESTURE_STEPS.length);
    }, autoAdvanceMs);
    return () => clearInterval(interval);
  }, [isPaused, autoAdvanceMs]);

  const step = GESTURE_STEPS[currentIndex] ?? GESTURE_STEPS[0]!;

  const borderClass =
    step.color === "coral"
      ? "border-[#ff6164]/70 shadow-[0_0_25px_rgba(255,97,100,0.25)]"
      : step.color === "peach"
      ? "border-[#ffac88]/70 shadow-[0_0_25px_rgba(255,172,136,0.25)]"
      : "border-[#60e1d5]/70 shadow-[0_0_25px_rgba(96,225,213,0.25)]";

  const actionTextClass =
    step.color === "coral"
      ? "text-[#ff6164]"
      : step.color === "peach"
      ? "text-[#ffac88]"
      : "text-[#60e1d5]";

  const badgeBgClass =
    step.color === "coral"
      ? "bg-[#ff6164]/20 border-[#ff6164] text-[#ff6164]"
      : step.color === "peach"
      ? "bg-[#ffac88]/20 border-[#ffac88] text-[#ffac88]"
      : "bg-[#60e1d5]/20 border-[#60e1d5] text-[#60e1d5]";

  return (
    <div
      className={`relative w-full rounded-2xl border-2 bg-gradient-to-br from-[#02373d] to-[#034a52] p-5 sm:p-6 transition-all duration-300 ${borderClass} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header bar: Step tabs & Auto-playing indicator */}
      <div className="flex items-center justify-between gap-2 border-b border-[#034a52] pb-3 mb-4">
        {/* Step dots / indicator tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {GESTURE_STEPS.map((s, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  active
                    ? "bg-[#00959a] text-white scale-105 shadow-md"
                    : "bg-[#02373d]/70 text-[#defcf9]/50 hover:text-white"
                }`}
              >
                <span>{s.badge}</span>
                <span className="hidden sm:inline text-[10px]">
                  {s.name.split("/")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Auto status pill */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#02373d] border border-[#00959a]/40 text-[#60e1d5]">
          <span
            className={`size-1.5 rounded-full ${
              isPaused ? "bg-amber-400" : "bg-[#60e1d5] animate-ping"
            }`}
          />
          <span>{isPaused ? "PAUSED" : "AUTO"}</span>
          <span className="text-[#defcf9]/50">· {currentIndex + 1}/4</span>
        </div>
      </div>

      {/* Main Single Gesture Display: Appears One by One */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-4 sm:gap-6 py-2">
        {/* Animated Moving SVG Display */}
        <div className="relative flex items-center justify-center p-3 rounded-2xl bg-[#02373d]/90 border border-[#00959a]/40 shrink-0 size-24 sm:size-28">
          <div className="absolute inset-0 bg-gradient-to-t from-[#60e1d5]/10 to-transparent rounded-2xl pointer-events-none" />
          {step.renderSvg("size-20 sm:size-24")}
        </div>

        {/* Concise Content: Exactly what user requested */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <h4 className="font-display font-extrabold text-white text-base sm:text-lg tracking-tight">
              {step.name}
            </h4>
            <span className="px-2.5 py-0.5 rounded-md border font-mono text-[11px] font-bold tracking-wide uppercase bg-[#02373d] text-[#defcf9]">
              {step.keyLabel}
            </span>
          </div>

          <p className={`text-sm sm:text-base font-bold tracking-tight ${actionTextClass}`}>
            {step.action}
          </p>

          <p className="text-xs sm:text-sm text-[#defcf9]/85 leading-snug">
            {step.desc}
          </p>
        </div>
      </div>

      {/* Auto-cycling Animated Progress Bar along the bottom */}
      <div className="mt-4 pt-3 border-t border-[#034a52] flex items-center justify-between gap-3 text-xs">
        {/* Navigation arrows for manual control */}
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + GESTURE_STEPS.length) % GESTURE_STEPS.length
              )
            }
            className="p-1 px-2 rounded bg-[#02373d] hover:bg-[#00959a] text-white text-xs font-mono border border-[#00959a]/40 transition-colors"
            title="Previous gesture"
          >
            ← Prev
          </button>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % GESTURE_STEPS.length)
            }
            className="p-1 px-2 rounded bg-[#02373d] hover:bg-[#00959a] text-white text-xs font-mono border border-[#00959a]/40 transition-colors"
            title="Next gesture"
          >
            Next →
          </button>
        </div>

        {/* Progress tracker line */}
        <div className="flex-1 mx-2 h-1.5 rounded-full bg-[#02373d] overflow-hidden">
          <div
            key={currentIndex}
            className="h-full bg-gradient-to-r from-[#00959a] via-[#60e1d5] to-[#ff6164]"
            style={{
              animation: isPaused
                ? "none"
                : `progressFill ${autoAdvanceMs}ms linear forwards`,
            }}
          />
        </div>

        <button
          onClick={() => setIsPaused((p) => !p)}
          className="text-[11px] font-mono text-[#defcf9]/60 hover:text-white"
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

/**
 * Modal version that wraps AutoGestureShowcase
 */
export function GestureGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#02373d]/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border-2 border-[#00959a] bg-[#02373d] p-5 sm:p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#034a52] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h3 className="font-display font-bold text-white text-base sm:text-lg">
              How to Play with Hand Gestures
            </h3>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-lg bg-[#034a52] hover:bg-[#ff6164] text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <AutoGestureShowcase autoAdvanceMs={3500} />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#defcf9]/60">
            Hover to pause auto-cycle · Click tabs to jump
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#60e1d5] text-[#02373d] hover:bg-[#defcf9] font-bold text-xs shadow-md transition-all font-mono"
          >
            Got It · Play Now →
          </button>
        </div>
      </div>
    </div>
  );
}
