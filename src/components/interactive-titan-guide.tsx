import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { levels } from "@/data/game-content";
import { voice } from "@/lib/voice-narrator";

interface StepGuide {
  num: string;
  badgeNum: number;
  label: string;
  subtitle: string;
  details: string;
  voiceLine: string;
  titanName: string;
  titanRole: string;
  character: "scout" | "shaper" | "master" | "guardian";
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
    voiceLine: "Greetings Commander! I am Comp Scout. Watch our sector briefing to identify comparable universes and lock in the control premium.",
    titanName: "Comp Scout",
    titanRole: "Valuation Comps Specialist",
    character: "scout",
    avatarImg: "/avatars/comp_scout_full.png",
    accentColor: "#60e1d5",
    borderColor: "border-[#60e1d5]",
    speechBg: "bg-gradient-to-r from-[#0b2830] to-[#081a20]",
    glowColor: "rgba(96,225,213,0.35)",
  },
  {
    num: "02",
    badgeNum: 2,
    label: "ANSWER",
    subtitle: "Knowledge challenges",
    details: "Solve tactical M&A questions alongside Deal Shaper. Distinguish offer values and deal structures.",
    voiceLine: "Deal Shaper online. Prepare for tactical challenges to distinguish offer value, transaction value, and consideration structures.",
    titanName: "Deal Shaper",
    titanRole: "Deal Consideration Titan",
    character: "shaper",
    avatarImg: "/avatars/deal_shaper_full.png",
    accentColor: "#ff6164",
    borderColor: "border-[#ff6164]",
    speechBg: "bg-gradient-to-r from-[#0b2830] to-[#081a20]",
    glowColor: "rgba(255,97,100,0.35)",
  },
  {
    num: "03",
    badgeNum: 3,
    label: "POWER UP",
    subtitle: "Earn sector power badges",
    details: "Master LTM calculations & multiples ranges with Multiple Master to forge your valuation badge.",
    voiceLine: "I am Multiple Master. Calculate latest twelve months multiples, analyze valuation spreads, and earn your sector power badge.",
    titanName: "Multiple Master",
    titanRole: "Multiples & Metrics Guru",
    character: "master",
    avatarImg: "/avatars/multiple_master_full.png",
    accentColor: "#ffac88",
    borderColor: "border-[#ffac88]",
    speechBg: "bg-gradient-to-r from-[#0b2830] to-[#081a20]",
    glowColor: "rgba(255,172,136,0.35)",
  },
  {
    num: "04",
    badgeNum: 4,
    label: "ARENA",
    subtitle: "Unlock Final Mastery",
    details: "Join Source Guardian to authenticate filing sources, connect all 4 sectors, and claim your Certificate!",
    voiceLine: "Source Guardian standing guard. Authenticate public filings, reconnect the valuation grid, and claim your Commander Certificate of Mastery!",
    titanName: "Source Guardian",
    titanRole: "Filing & Source Protector",
    character: "guardian",
    avatarImg: "/avatars/source_guardian_full.png",
    accentColor: "#60e1d5",
    borderColor: "border-[#60e1d5]",
    speechBg: "bg-gradient-to-r from-[#0b2830] to-[#081a20]",
    glowColor: "rgba(96,225,213,0.35)",
  },
];

/**
 * Interactive Game Guide with Character Voiceover Narrations
 */
export function InteractiveTitanGuide({
  onSelectSector,
}: {
  onSelectSector?: (index: number) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [voiceActive, setVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const current = GUIDE_STEPS[activeStep] ?? GUIDE_STEPS[0]!;

  useEffect(() => {
    setVoiceActive(voice.isVoiceEnabled());
    return voice.subscribe((speaking) => setIsSpeaking(speaking));
  }, []);

  useEffect(() => {
    // Auto-play the first step intro voice on mount when voiceover is active
    const timer = setTimeout(() => {
      if (voiceActive) {
        voice.speak(current.voiceLine, { character: current.character });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleStepSelect = (idx: number, playAudio: boolean = true) => {
    setActiveStep(idx);
    const step = GUIDE_STEPS[idx];
    if (step && playAudio && voiceActive) {
      voice.speak(step.voiceLine, { character: step.character });
    }
  };

  const toggleVoiceOver = () => {
    const next = voice.toggleVoice();
    setVoiceActive(next);
    if (next) {
      voice.speak(current.voiceLine, { character: current.character });
    }
  };

  const playCurrentVoice = () => {
    if (!voiceActive) {
      voice.setVoiceEnabled(true);
      setVoiceActive(true);
    }
    voice.speak(current.voiceLine, { character: current.character });
  };

  return (
    <div className="relative rounded-3xl border-2 border-[#00b4ba]/60 bg-gradient-to-b from-[#0b2830]/95 via-[#0d333d]/90 to-[#081a20]/95 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.65)] overflow-hidden">
      {/* Background cyber grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00b4ba]/20 via-transparent to-transparent pointer-events-none" />

      {/* Top Title Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#00b4ba]/30 pb-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[.22em] text-[#68ede2]">
            <span className="size-2 rounded-full bg-[#68ede2] animate-ping" />
            Tactical Mission Briefing · Commander Guide
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            About Transaction Titans
          </h2>
          <p className="text-xs sm:text-sm text-[#e6faf7] max-w-2xl mt-1.5 leading-relaxed font-normal">
            Restore the Valuation Grid through 4 tactical finance sectors. Deploy into each sector, watch the video briefing, master the concepts, and pass each knowledge check to unlock the Final Assessment Arena!
          </p>
        </div>

        {/* Voiceover Control & Step Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0">
          {/* Voiceover On/Off Toggle Button */}
          <button
            onClick={toggleVoiceOver}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              voiceActive
                ? "border-[#60e1d5] bg-[#00959a] text-white shadow-[0_0_15px_rgba(96,225,213,0.35)]"
                : "border-[#034a52] bg-[#02373d] text-[#defcf9]/50 hover:text-white"
            }`}
            title="Toggle Titan Voiceover Narration"
          >
            {voiceActive ? <Volume2 className="size-3.5 text-white animate-pulse" /> : <VolumeX className="size-3.5" />}
            <span>{voiceActive ? "Voice On" : "Voice Off"}</span>
          </button>

          {/* Step Badges */}
          {GUIDE_STEPS.map((s, idx) => {
            const isActive = idx === activeStep;
            return (
              <button
                key={s.num}
                onClick={() => handleStepSelect(idx)}
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
      <div className="relative z-10 grid md:grid-cols-[220px_1fr] items-center gap-6 sm:gap-8 bg-[#06181e]/85 rounded-2xl border border-[#00b4ba]/45 p-4 sm:p-6 mb-6">
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
              className={`relative h-full w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-transform duration-300 ${
                isSpeaking ? "scale-105" : "scale-100"
              }`}
            />
          </div>

          {/* Titan Badge */}
          <div className="mt-2 text-center">
            <span
              className="text-[10px] font-mono font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-[#081a20]"
              style={{ color: current.accentColor, borderColor: current.accentColor }}
            >
              {current.titanName}
            </span>
            <span className="block text-xs text-[#d0f5f0] mt-1 font-semibold">
              {current.titanRole}
            </span>
          </div>
        </div>

        {/* Right: RPG Speech Bubble with Comic Tail & Audio Play Button */}
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                {/* Round Step Number Badge */}
                <div
                  className="size-8 rounded-xl flex items-center justify-center text-sm font-extrabold text-[#081a20] shadow-md"
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

              {/* Character Voiceover Trigger Pill */}
              <button
                onClick={playCurrentVoice}
                className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl border border-white/30 bg-[#081a20] text-white hover:bg-[#00b4ba] hover:text-[#081a20] hover:border-white transition-all shadow-md group font-bold"
                title="Play Titan Voice"
              >
                <Volume2
                  className={`size-4 text-[#68ede2] group-hover:text-[#081a20] ${
                    isSpeaking ? "animate-bounce" : ""
                  }`}
                />
                <span className="font-semibold font-sans">
                  {isSpeaking ? "Speaking…" : "Hear Titan"}
                </span>
              </button>
            </div>

            {/* Dialogue / Instructional Text with larger font */}
            <p className="text-base sm:text-lg text-[#f2fcfa] leading-relaxed font-semibold">
              "{current.details}"
            </p>

            {/* Bottom Actions inside speech bubble */}
            <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleStepSelect(
                      (activeStep - 1 + GUIDE_STEPS.length) % GUIDE_STEPS.length
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-[#00b4ba] bg-[#081a20] text-white text-xs font-bold hover:bg-[#00b4ba] hover:text-[#081a20] transition-colors"
                >
                  ← Prev Step
                </button>
                <button
                  onClick={() =>
                    handleStepSelect((activeStep + 1) % GUIDE_STEPS.length)
                  }
                  className="px-3 py-1.5 rounded-lg border border-[#00b4ba] bg-[#081a20] text-white text-xs font-bold hover:bg-[#00b4ba] hover:text-[#081a20] transition-colors"
                >
                  Next Step →
                </button>
              </div>

              {onSelectSector && (
                <button
                  onClick={() => onSelectSector(activeStep)}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#081a20] hover:brightness-110 shadow-lg transition-transform active:scale-95 flex items-center gap-2"
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
              onClick={() => handleStepSelect(idx)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 relative overflow-hidden group shadow-sm ${
                isSelected
                  ? "border-[#00959a] bg-white shadow-md scale-[1.02]"
                  : "border-[#00959a]/30 bg-white/90 hover:border-[#00959a] hover:bg-white"
              }`}
            >
              {/* Top Row: Mini Avatar thumbnail + Number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: isSelected ? step.accentColor : "#defcf9",
                    color: isSelected ? "#02373d" : "#02373d",
                  }}
                >
                  {step.num} · {step.label}
                </span>

                <div className="size-8 rounded-full overflow-hidden border border-[#00959a]/30 bg-white shrink-0">
                  <img
                    src={step.avatarImg}
                    alt={step.titanName}
                    className="size-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Title */}
              <h4 className="font-bold text-[#02373d] text-xs sm:text-sm line-clamp-1">
                {step.subtitle}
              </h4>
              <p className="text-[10px] text-[#034a52]/80 line-clamp-1 mt-0.5 font-medium">
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
