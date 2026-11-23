import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, Check, Hand, Sparkles, Volume2, VolumeX,
  Play, Pause, RotateCcw, Award, ThumbsUp, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { levels, arenaQuestions, type GameLevel, type GameQuestion } from "@/data/game-content";

export const Route = createFileRoute("/minimal")({
  head: () => ({
    meta: [
      { title: "Minimal Valuation Arena · Hand Gesture Edition" },
      { name: "description", content: "Minimalist valuation game with avatar selection and hand gestures guide." },
    ],
  }),
  component: MinimalGame,
});

type Avatar = {
  id: string;
  name: string;
  title: string;
  color: string;
  border: string;
  bg: string;
  glow: string;
  specialty: string;
  image: string;
};

const AVATARS: Avatar[] = [
  {
    id: "scout",
    name: "Aero",
    title: "Comp Scout",
    color: "#60e1d5",
    border: "border-[#60e1d5]",
    bg: "bg-[#034a52]",
    glow: "shadow-[0_0_25px_rgba(96,225,213,0.35)]",
    specialty: "Comparable Universe & Premiums",
    image: "/avatars/comp_scout.jpg",
  },
  {
    id: "shaper",
    name: "Ignis",
    title: "Deal Shaper",
    color: "#ff6164",
    border: "border-[#ff6164]",
    bg: "bg-[#034a52]",
    glow: "shadow-[0_0_25px_rgba(255,97,100,0.35)]",
    specialty: "Deal Consideration & Capital",
    image: "/avatars/deal_shaper.jpg",
  },
  {
    id: "master",
    name: "Sol",
    title: "Multiple Master",
    color: "#ffac88",
    border: "border-[#ffac88]",
    bg: "bg-[#034a52]",
    glow: "shadow-[0_0_25px_rgba(255,172,136,0.35)]",
    specialty: "LTM Metrics & Multiples",
    image: "/avatars/multiple_master.jpg",
  },
  {
    id: "guardian",
    name: "Terra",
    title: "Source Guardian",
    color: "#00959a",
    border: "border-[#00959a]",
    bg: "bg-[#034a52]",
    glow: "shadow-[0_0_25px_rgba(0,149,154,0.35)]",
    specialty: "SEC Filings & Source Documents",
    image: "/avatars/source_guardian.jpg",
  },
];

type GestureGuide = {
  emoji: string;
  name: string;
  action: string;
  keyboard: string;
  description: string;
};

const GESTURE_CONTROLS: GestureGuide[] = [
  {
    emoji: "👆",
    name: "Index Finger / Tap",
    action: "Select Option A / B / C / D",
    keyboard: "Keys [1, 2, 3, 4] or Click",
    description: "Hold index finger up to highlight or click directly on any mission card.",
  },
  {
    emoji: "👍",
    name: "Thumbs Up",
    action: "Confirm & Submit Answer",
    keyboard: "Key [Enter] or 'Submit'",
    description: "Give a thumbs-up gesture to lock in your selected choice.",
  },
  {
    emoji: "👋",
    name: "Open Palm / Wave",
    action: "Next Question or Continue",
    keyboard: "Key [Space] or 'Next'",
    description: "Wave open palm to advance seamlessly to the next challenge.",
  },
  {
    emoji: "✌️",
    name: "Victory / Peace Sign",
    action: "Toggle Video Play / Pause",
    keyboard: "Key [P] or Play Button",
    description: "Hold two fingers up to pause or resume the tactical briefing video.",
  },
];

export function MinimalGame() {
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(AVATARS[0]!);
  const [activeSector, setActiveSector] = useState<number>(0);
  const [mode, setMode] = useState<"lobby" | "briefing" | "challenge" | "results">("lobby");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [gestureGuideOpen, setGestureGuideOpen] = useState(false);

  const level: GameLevel = levels[activeSector] ?? levels[0]!;
  const currentQ: GameQuestion = level.questions[questionIdx] ?? level.questions[0]!;

  const handleSelectOption = (opt: string) => {
    if (feedback !== null) return;
    if (currentQ.type === "multi") {
      setSelectedOptions((prev) =>
        prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
      );
    } else {
      setSelectedOptions([opt]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0 || feedback !== null) return;
    const isCorrect =
      currentQ.type === "single"
        ? selectedOptions[0] === currentQ.correctAnswers[0]
        : selectedOptions.length === currentQ.correctAnswers.length &&
          currentQ.correctAnswers.every((a) => selectedOptions.includes(a));

    setFeedback(isCorrect);
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (questionIdx < level.questions.length - 1) {
      setQuestionIdx((i) => i + 1);
      setSelectedOptions([]);
      setFeedback(null);
    } else {
      setMode("results");
    }
  };

  const restartSector = () => {
    setQuestionIdx(0);
    setSelectedOptions([]);
    setFeedback(null);
    setScore(0);
    setMode("briefing");
  };

  return (
    <div className="min-h-screen bg-[#02373d] text-[#defcf9] font-sans antialiased selection:bg-[#00959a] selection:text-white">
      {/* Top Minimal Bar */}
      <header className="border-b border-[#034a52] bg-[#02373d]/90 backdrop-blur sticky top-0 z-50 px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs uppercase tracking-widest text-[#60e1d5] hover:underline flex items-center gap-1.5 font-bold">
            <ArrowLeft className="size-4" /> Full Game
          </Link>
          <span className="text-[#034a52] hidden sm:inline">|</span>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
            <span className="text-[#60e1d5]">⚡</span> Valuation Titans <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#034a52] text-[#60e1d5] border border-[#00959a]">Minimal</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGestureGuideOpen(true)}
            className="text-xs border border-[#00959a]/60 hover:bg-[#034a52] text-[#60e1d5] flex items-center gap-1.5"
          >
            <Hand className="size-3.5" />
            <span className="hidden sm:inline">Gesture Controls</span>
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-[#034a52]">
            <div className={`size-8 rounded-full border-2 ${selectedAvatar.border} overflow-hidden`}>
              <img src={selectedAvatar.image} alt={selectedAvatar.name} className="size-full object-cover" />
            </div>
            <span className="text-xs font-semibold hidden md:inline text-[#defcf9]">{selectedAvatar.name}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 1. LOBBY: Avatar & Sector Selection */}
        {mode === "lobby" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header intro */}
            <div className="text-center space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">Choose Your Commander</h1>
              <p className="text-sm text-[#defcf9]/70 max-w-lg mx-auto">
                Select your avatar character, review the hand gesture controls, and pick a tactical valuation mission.
              </p>
            </div>

            {/* Avatar Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar.id === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av)}
                    className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                      isSelected
                        ? `${av.border} ${av.bg} ${av.glow} scale-[1.03]`
                        : "border-[#034a52] bg-[#02373d]/60 hover:border-[#00959a] hover:bg-[#034a52]/40"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 size-5 rounded-full bg-[#60e1d5] text-[#02373d] flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                    <div className="size-24 rounded-2xl overflow-hidden border border-[#00959a]/40 shadow-inner">
                      <img src={av.image} alt={av.name} className="size-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{av.name}</h3>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-[#60e1d5]">{av.title}</p>
                      <p className="text-[10px] text-[#defcf9]/60 mt-1 line-clamp-1">{av.specialty}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hand Gesture Banner */}
            <div className="p-5 rounded-xl border border-[#00959a]/40 bg-[#034a52]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="size-12 rounded-xl bg-[#00959a]/30 border border-[#60e1d5]/50 flex items-center justify-center text-2xl shrink-0">
                  👋
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Play with Hands or Clicks</h4>
                  <p className="text-xs text-[#defcf9]/70 mt-0.5">
                    Start with simple gestures: 👆 Point to pick, 👍 Thumbs-up to submit, 👋 Wave to continue.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGestureGuideOpen(true)}
                className="border-[#60e1d5] text-[#60e1d5] hover:bg-[#60e1d5] hover:text-[#02373d] text-xs font-semibold shrink-0"
              >
                View Gesture Guide
              </Button>
            </div>

            {/* Sector Selector */}
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-white">Select Valuation Mission</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {levels.map((lvl, index) => {
                  const isSelected = activeSector === index;
                  return (
                    <button
                      key={lvl.number}
                      onClick={() => setActiveSector(index)}
                      className={`p-5 rounded-xl border-2 text-left transition-all space-y-2.5 ${
                        isSelected
                          ? "border-[#60e1d5] bg-[#034a52] shadow-[0_0_20px_rgba(96,225,213,0.2)]"
                          : "border-[#034a52] bg-[#02373d]/80 hover:border-[#00959a]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#60e1d5] font-bold">
                          Sector 0{lvl.number}
                        </span>
                        <span className="text-lg">{lvl.emblem}</span>
                      </div>
                      <h3 className="font-bold text-white text-base">{lvl.title}</h3>
                      <p className="text-xs text-[#defcf9]/70 line-clamp-2 leading-relaxed">{lvl.goal}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {lvl.callouts.map((c) => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-[#02373d] border border-[#00959a]/40 text-[#defcf9]/80">
                            {c}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <Button
                  size="lg"
                  onClick={() => setMode("briefing")}
                  className="bg-[#60e1d5] text-[#02373d] hover:bg-[#defcf9] font-bold px-8 shadow-lg shadow-[#60e1d5]/20"
                >
                  Launch Sector 0{level.number} <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 2. BRIEFING STAGE: Video + Goal */}
        {mode === "briefing" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setMode("lobby")} className="text-xs text-[#60e1d5]">
                <ArrowLeft className="size-3.5 mr-1" /> Back to Missions
              </Button>
              <span className="text-xs font-mono uppercase tracking-widest text-[#60e1d5]">
                Sector 0{level.number} Briefing
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{level.title}</h1>
              <p className="text-sm text-[#defcf9]/80">{level.goal}</p>
            </div>

            {/* Video Player */}
            <div className="rounded-xl overflow-hidden border border-[#00959a] bg-black aspect-video relative group">
              {level.videoSrc ? (
                <video
                  src={level.videoSrc}
                  controls
                  playsInline
                  className="size-full object-contain"
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                />
              ) : (
                <div className="size-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#034a52]">
                  <span className="text-4xl text-[#60e1d5]">{level.emblem}</span>
                  <p className="text-sm text-[#defcf9]/80 max-w-md">
                    Tactical video briefing for this sector is currently offline. Review the key terms below to proceed.
                  </p>
                </div>
              )}
            </div>

            {/* Callouts */}
            <div className="p-4 rounded-xl border border-[#034a52] bg-[#034a52]/40 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase text-[#60e1d5]">Target Concepts</p>
                <p className="text-sm font-semibold text-white mt-0.5">{level.callouts.join(" • ")}</p>
              </div>
              <Button
                onClick={() => {
                  setQuestionIdx(0);
                  setSelectedOptions([]);
                  setFeedback(null);
                  setScore(0);
                  setMode("challenge");
                }}
                className="bg-[#ff6164] hover:bg-[#ff7c6b] text-white font-bold px-6"
              >
                Begin Knowledge Check <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* 3. CHALLENGE STAGE: Clean Minimal Quiz */}
        {mode === "challenge" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header progress */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#60e1d5]">SECTOR 0{level.number} · MISSION CHECK</span>
              <span className="text-[#defcf9]/80">QUESTION {questionIdx + 1} OF {level.questions.length}</span>
            </div>
            <Progress value={((questionIdx + 1) / level.questions.length) * 100} className="h-2 bg-[#034a52]" />

            {/* Question Card */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-[#034a52] bg-[#034a52]/60 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                  {currentQ.stem}
                </h2>
                <div className={`size-12 rounded-full border-2 ${selectedAvatar.border} overflow-hidden shrink-0 shadow-md`}>
                  <img src={selectedAvatar.image} alt={selectedAvatar.name} className="size-full object-cover" />
                </div>
              </div>

              {currentQ.type === "multi" && (
                <p className="text-xs text-[#60e1d5] font-mono">Select every correct answer.</p>
              )}

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOptions.includes(option);
                  const isCorrect = currentQ.correctAnswers.includes(option);
                  const showStatus = feedback !== null;

                  let cardStyle = "border-[#034a52] bg-[#02373d]/70 hover:border-[#00959a] hover:bg-[#034a52]/40";
                  if (isSelected) cardStyle = "border-[#60e1d5] bg-[#034a52] text-white";
                  if (showStatus && isCorrect) cardStyle = "border-[#60e1d5] bg-[#00959a]/30 text-white";
                  if (showStatus && isSelected && !isCorrect) cardStyle = "border-[#ff6164] bg-[#ff6164]/20 text-[#defcf9]";

                  return (
                    <button
                      key={option}
                      disabled={feedback !== null}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition-all ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`size-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold ${
                          isSelected ? "border-[#60e1d5] bg-[#60e1d5] text-[#02373d]" : "border-[#00959a]/50 text-[#60e1d5]"
                        }`}>
                          {letter}
                        </span>
                        <span className="text-sm sm:text-base font-medium">{option}</span>
                      </div>
                      {showStatus && isCorrect && <Check className="size-5 text-[#60e1d5] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {feedback !== null && (
                <div className={`p-4 rounded-xl border ${
                  feedback ? "border-[#60e1d5] bg-[#00959a]/20" : "border-[#ff6164] bg-[#ff6164]/20"
                } space-y-1`}>
                  <p className="font-bold text-sm flex items-center gap-2">
                    {feedback ? "✅ Excellent valuation insight!" : "❌ Concept review needed."}
                  </p>
                  <p className="text-xs text-[#defcf9]/80 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGestureGuideOpen(true)}
                  className="text-xs text-[#60e1d5]"
                >
                  <Hand className="size-3.5 mr-1.5" /> Gesture Help
                </Button>

                {feedback === null ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedOptions.length === 0}
                    className="bg-[#60e1d5] hover:bg-[#defcf9] text-[#02373d] font-bold px-6"
                  >
                    Submit Answer (👍)
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-[#ff6164] hover:bg-[#ff7c6b] text-white font-bold px-6"
                  >
                    {questionIdx < level.questions.length - 1 ? "Next Question (👋)" : "See Results (👋)"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. RESULTS STAGE */}
        {mode === "results" && (
          <div className="p-8 rounded-2xl border-2 border-[#034a52] bg-[#034a52]/60 text-center space-y-6 animate-in fade-in duration-300">
            <div className={`size-28 rounded-full border-4 ${selectedAvatar.border} mx-auto overflow-hidden shadow-2xl ${selectedAvatar.glow}`}>
              <img src={selectedAvatar.image} alt={selectedAvatar.name} className="size-full object-cover" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#60e1d5]">Mission Completed</span>
              <h2 className="font-display text-3xl font-bold text-white">{level.hero} Restored</h2>
              <p className="text-sm text-[#defcf9]/70">Commander {selectedAvatar.name} cleared Sector 0{level.number}.</p>
            </div>

            <div className="inline-block px-6 py-3 rounded-xl bg-[#02373d] border border-[#00959a]">
              <span className="text-xs text-[#defcf9]/70 block font-mono">ACCURACY SCORE</span>
              <span className="font-display text-3xl font-extrabold text-[#60e1d5]">
                {score} / {level.questions.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button onClick={restartSector} variant="outline" className="border-[#00959a] text-[#defcf9] hover:bg-[#034a52]">
                <RotateCcw className="size-4 mr-1.5" /> Replay Mission
              </Button>
              <Button onClick={() => setMode("lobby")} className="bg-[#60e1d5] text-[#02373d] hover:bg-[#defcf9] font-bold">
                Pick Another Sector
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Hand Gesture Modal Guide */}
      {gestureGuideOpen && (
        <div className="fixed inset-0 z-50 bg-[#02373d]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border-2 border-[#00959a] bg-[#02373d] p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#034a52] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-[#00959a]/30 border border-[#60e1d5]/50 flex items-center justify-center text-xl">
                  👋
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg">Hand Gestures Guide</h3>
                  <p className="text-xs text-[#defcf9]/60">How to control the minimal game with physical gestures</p>
                </div>
              </div>
              <button
                onClick={() => setGestureGuideOpen(false)}
                className="text-[#defcf9]/60 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {GESTURE_CONTROLS.map((g) => (
                <div
                  key={g.name}
                  className="p-3.5 rounded-xl border border-[#034a52] bg-[#034a52]/40 flex items-start gap-3.5"
                >
                  <span className="text-2xl shrink-0 p-1 bg-[#02373d] rounded-lg border border-[#00959a]/40">{g.emoji}</span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">{g.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#02373d] text-[#60e1d5] border border-[#00959a]/40">
                        {g.keyboard}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#60e1d5]">{g.action}</p>
                    <p className="text-[11px] text-[#defcf9]/70">{g.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#034a52] border border-[#00959a]/30 text-xs text-[#defcf9]/80 leading-relaxed">
              💡 <strong className="text-white">Quick Start Tip:</strong> You can play naturally by clicking or tapping on screen, or follow the gesture cues (👆 Point, 👍 Thumbs Up, 👋 Wave) as an intuitive physical interaction model!
            </div>

            <div className="text-right">
              <Button
                onClick={() => setGestureGuideOpen(false)}
                className="bg-[#60e1d5] text-[#02373d] hover:bg-[#defcf9] font-bold px-6"
              >
                Got It, Let&apos;s Play!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
