import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, AudioLines, Award, BadgeCheck, Check, ChevronRight,
  CircleHelp, FileBadge, Flame, Headphones, LockKeyhole, Maximize2, Pause,
  Play, RotateCcw, Settings2, Shield, Sparkles, Volume2, VolumeX, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { HeroFigure, GridMap } from "@/components/game-ui";
import { InteractiveTitanGuide } from "@/components/interactive-titan-guide";
import {
  arenaQuestions, levels, premiumFormula, transactionValueFormula, universeFactors, valuationSteps,
  type GameLevel, type GameQuestion,
} from "@/data/game-content";
import {
  ARENA_PASS_MARK, calculateArenaScore, canEnterArena, createInitialProgress,
  recordLevelResult, scoreAnswer, type GameProgress,
} from "@/data/game-progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Transaction Titans: The Valuation Force" },
      { name: "description", content: "Restore the Valuation Grid through five finance learning missions." },
      { property: "og:title", content: "Transaction Titans: The Valuation Force" },
      { property: "og:description", content: "Restore the Valuation Grid through five finance learning missions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransactionTitans,
});

type Screen = "title" | "story" | "hub" | "gate" | "video" | "quiz" | "unlock" | "arena" | "arena-results" | "certificate";
const STORAGE_KEY = "transaction-titans-progress-v1";

function TransactionTitans() {
  const [progress, setProgress] = useState<GameProgress>(() => createInitialProgress());
  const [screen, setScreen] = useState<Screen>("title");
  const [activeLevel, setActiveLevel] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [introPanel, setIntroPanel] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [retryUsed, setRetryUsed] = useState(false);
  const [levelAnswers, setLevelAnswers] = useState<boolean[]>([]);
  const [arenaAnswers, setArenaAnswers] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoElapsed, setVideoElapsed] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState("");
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameProgress;
        if (parsed.levels?.length === levels.length) {
          setProgress(parsed);
          setScreen(parsed.introSeen ? "hub" : "title");
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [loaded, progress]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (screen !== "video" || !videoPlaying) return;
    const timer = window.setInterval(() => setVideoElapsed((current) => Math.min(25, current + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [screen, videoPlaying]);

  const completedCount = progress.levels.filter((item) => item.status === "complete").length;
  const xp = completedCount * 500 + progress.levels.reduce((sum, item) => sum + item.bestScore * 25, 0);
  const active = levels[activeLevel];
  const arenaOpen = canEnterArena(progress);
  const currentQuestion: GameQuestion | undefined = screen === "arena" ? arenaQuestions[quizIndex] : active?.questions[quizIndex];
  const currentStatus = progress.levels[activeLevel]?.status;
  const restored = Math.round((completedCount / levels.length) * 100);

  const playTone = (kind: "click" | "correct" | "wrong" | "unlock" = "click") => {
    if (!soundOn) return;
    try {
      const AudioCtor = window.AudioContext;
      if (!AudioCtor) return;
      const context = audioContext.current ?? new AudioCtor();
      audioContext.current = context;
      const now = context.currentTime;
      const notes = kind === "unlock" ? [392, 523.25, 659.25, 783.99] : kind === "correct" ? [523.25, 659.25] : kind === "wrong" ? [170, 130] : [440];
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = kind === "wrong" ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + index * 0.09);
        gain.gain.exponentialRampToValueAtTime(kind === "unlock" ? 0.13 : 0.07, now + index * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.32);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + index * 0.09);
        oscillator.stop(now + index * 0.09 + 0.34);
      });
    } catch {
      // Audio is an optional enhancement; gameplay remains fully usable without it.
    }
  };

  const updateProgress = (next: GameProgress) => setProgress(next);
  const beginStory = () => {
    playTone();
    if (progress.introSeen) setScreen("hub");
    else {
      setIntroPanel(0);
      setScreen("story");
    }
  };
  const openLevel = (index: number) => {
    if (index === 4) {
      if (!arenaOpen) return;
      setScreen("arena");
      setQuizIndex(0);
      setSelected([]);
      setAnswered(null);
      setRetryUsed(false);
      setArenaAnswers([]);
      setScore(0);
      playTone();
      return;
    }
    if (progress.levels[index]?.status === "locked") return;
    setActiveLevel(index);
    updateProgress({ ...progress, currentLevel: index + 1 });
    setScreen("gate");
    playTone();
  };
  const startVideo = () => {
    updateProgress({ ...progress, levels: progress.levels.map((item, index) => index === activeLevel ? { ...item, status: "in_progress" } : item) });
    setVideoElapsed(0);
    setVideoPlaying(false);
    setScreen("video");
  };
  const markVideoWatched = () => {
    updateProgress({ ...progress, levels: progress.levels.map((item, index) => index === activeLevel ? { ...item, videoWatched: true, status: "in_progress" } : item) });
    setVideoPlaying(false);
    setQuizIndex(0);
    setLevelAnswers([]);
    setSelected([]);
    setAnswered(null);
    setRetryUsed(false);
    setScreen("quiz");
    playTone();
  };
  const toggleAnswer = (answer: string) => {
    if (answered !== null) return;
    setSelected((current) => current.includes(answer) ? current.filter((item) => item !== answer) : currentQuestion?.type === "multi" ? [...current, answer] : [answer]);
    playTone();
  };
  const submitAnswer = () => {
    if (!currentQuestion || selected.length === 0 || answered !== null) return;
    const correct = scoreAnswer(selected, currentQuestion.correctAnswers, currentQuestion.type);
    setAnswered(correct);
    setStreak((value) => correct ? value + 1 : 0);
    playTone(correct ? "correct" : "wrong");
  };
  const advanceQuestion = () => {
    if (!currentQuestion || answered === null) return;
    if (!answered && !retryUsed) {
      setRetryUsed(true);
      setAnswered(null);
      setSelected([]);
      return;
    }
    const nextAnswers = [...(screen === "arena" ? arenaAnswers : levelAnswers), answered];
    if (screen === "arena") setArenaAnswers(nextAnswers);
    else setLevelAnswers(nextAnswers);
    const nextIndex = quizIndex + 1;
    const totalQuestions = screen === "arena" ? arenaQuestions.length : (active?.questions.length ?? 0);
    if (nextIndex < totalQuestions) {
      setQuizIndex(nextIndex);
      setSelected([]);
      setAnswered(null);
      setRetryUsed(false);
      return;
    }
    const finalScore = nextAnswers.filter(Boolean).length;
    setScore(finalScore);
    if (screen === "arena") {
      updateProgress({ ...progress, finalScore, commanderName: progress.commanderName });
      setScreen("arena-results");
    } else {
      const updated = recordLevelResult(progress, activeLevel, finalScore);
      updateProgress(updated);
      if (finalScore >= ARENA_PASS_MARK) {
        playTone("unlock");
        setScreen("unlock");
      } else {
        setToast("Mission needs another run · 4/5 required");
        setScreen("gate");
      }
    }
  };
  const resetProgress = () => {
    const fresh = createInitialProgress();
    updateProgress(fresh);
    setScreen("title");
    setActiveLevel(0);
    setSettingsOpen(false);
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Valuation Grid reset");
  };
  const downloadCertificate = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#102638";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#54d4c5";
    ctx.lineWidth = 5;
    ctx.strokeRect(42, 42, 1516, 1016);
    ctx.strokeStyle = "#f2c14e";
    ctx.lineWidth = 2;
    ctx.strokeRect(62, 62, 1476, 976);
    ctx.textAlign = "center";
    ctx.fillStyle = "#72e2d5";
    ctx.font = "600 30px sans-serif";
    ctx.fillText("THE VALUATION FORCE", 800, 210);
    ctx.fillStyle = "#f2c14e";
    ctx.font = "bold 76px sans-serif";
    ctx.fillText("CERTIFICATE OF MASTERY", 800, 340);
    ctx.fillStyle = "#e9f1f1";
    ctx.font = "32px sans-serif";
    ctx.fillText("This certifies that", 800, 470);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 70px sans-serif";
    ctx.fillText(progress.commanderName || "Valuation Force Commander", 800, 570);
    ctx.fillStyle = "#e9f1f1";
    ctx.font = "30px sans-serif";
    ctx.fillText("has restored the Valuation Grid and completed the Final Assessment Arena", 800, 680);
    ctx.fillStyle = "#72e2d5";
    ctx.font = "26px sans-serif";
    ctx.fillText(`FINAL SCORE  ${progress.finalScore ?? score}/5     •     ${new Date().toLocaleDateString()}`, 800, 830);
    ctx.fillStyle = "#f2c14e";
    ctx.font = "52px sans-serif";
    ctx.fillText("✦   ✦   ✦   ✦   ✦", 800, 940);
    const anchor = document.createElement("a");
    anchor.download = "valuation-force-certificate.png";
    anchor.href = canvas.toDataURL("image/png");
    anchor.click();
  };

  const mapStatuses = useMemo(() => progress.levels.map((item) => item.status), [progress.levels]);

  if (!loaded) {
    return <main className="grid-world flex min-h-screen items-center justify-center bg-background text-foreground"><div className="flex items-center gap-3 text-sm text-muted-foreground"><AudioLines className="size-4 animate-pulse text-energy" /> Initializing Grid…</div></main>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 grid-world energy-grid opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,oklch(0.38_0.09_205/18%),transparent_55%)]" />
      <header className="relative z-20 flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-md sm:px-8">
        <button onClick={() => setScreen("hub")} className="flex items-center gap-3 text-left" aria-label="Go to Valuation Grid">
          <div className="flex size-9 items-center justify-center border border-energy/50 bg-accent/70 text-energy"><Shield className="size-5" /></div>
          <span><span className="display-font block text-xs font-bold uppercase tracking-[.12em]">Transaction Titans</span><span className="hidden text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:block">The Valuation Force</span></span>
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/minimal"
            className="hidden items-center gap-1.5 rounded-sm border border-energy/60 bg-accent/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-energy hover:bg-accent transition-colors sm:flex"
          >
            <Sparkles className="size-3.5" /> Minimal Edition
          </Link>
          <div className="hidden items-center gap-2 rounded-sm border border-border bg-card/75 px-3 py-2 sm:flex"><Sparkles className="size-3.5 text-primary" /><span className="text-xs font-semibold tabular-nums">{xp.toLocaleString()} XP</span></div>
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><BadgeCheck className="size-4 text-hero-gold" />{progress.badges.length}/4</div>
          <Button variant="ghost" size="icon" onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? "Mute sound" : "Enable sound"} title={soundOn ? "Mute sound" : "Enable sound"}>{soundOn ? <Volume2 /> : <VolumeX />}</Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Open settings" title="Settings"><Settings2 /></Button>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-[1220px] px-4 pb-14 pt-5 sm:px-8 sm:pt-8">
        {screen === "title" && <TitleScreen hasProgress={progress.introSeen || completedCount > 0} completedCount={completedCount} onStart={beginStory} onContinue={() => setScreen("hub")} />}
        {screen === "story" && <StoryScreen panel={introPanel} onNext={() => { if (introPanel < 2) setIntroPanel(introPanel + 1); else { updateProgress({ ...progress, introSeen: true }); setScreen("hub"); } }} onSkip={() => { updateProgress({ ...progress, introSeen: true }); setScreen("hub"); }} />}
        {screen === "hub" && <HubScreen progress={progress} statuses={mapStatuses} restored={restored} xp={xp} arenaOpen={arenaOpen} onSelect={openLevel} />}
        {screen === "gate" && active && <LevelGate level={active} status={currentStatus ?? "available"} onBack={() => setScreen("hub")} onStart={startVideo} onReplay={() => { setVideoElapsed(0); setScreen("video"); }} watched={progress.levels[activeLevel]?.videoWatched ?? false} />}
        {screen === "video" && active && <VideoStage level={active} elapsed={videoElapsed} playing={videoPlaying} captions={captions} watched={progress.levels[activeLevel]?.videoWatched ?? false} onBack={() => setScreen("gate")} onPlay={() => setVideoPlaying((value) => !value)} onReplay={() => { setVideoElapsed(0); setVideoPlaying(false); }} onCaptions={() => setCaptions((value) => !value)} onWatched={markVideoWatched} />}
        {screen === "quiz" && active && currentQuestion && <QuizStage level={active} question={currentQuestion} index={quizIndex} selected={selected} answered={answered} retryUsed={retryUsed} streak={streak} onSelect={toggleAnswer} onSubmit={submitAnswer} onAdvance={advanceQuestion} />}
        {screen === "unlock" && active && <UnlockScreen level={active} score={score} allComplete={arenaOpen} onContinue={() => setScreen("hub")} onArena={() => { setScreen("hub"); setTimeout(() => openLevel(4), 0); }} />}
        {screen === "arena" && currentQuestion && <ArenaStage question={currentQuestion} index={quizIndex} selected={selected} answered={answered} retryUsed={retryUsed} arenaAnswers={arenaAnswers} onSelect={toggleAnswer} onSubmit={submitAnswer} onAdvance={advanceQuestion} />}
        {screen === "arena-results" && <ArenaResults score={progress.finalScore ?? score} name={progress.commanderName} onName={(name) => updateProgress({ ...progress, commanderName: name })} onContinue={() => setScreen((progress.finalScore ?? score) >= ARENA_PASS_MARK ? "certificate" : "hub")} />}
        {screen === "certificate" && <Certificate name={progress.commanderName} score={progress.finalScore ?? score} onBack={() => setScreen("hub")} onDownload={downloadCertificate} />}
      </div>

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 border border-primary/40 bg-card px-4 py-3 text-sm font-medium shadow-xl">{toast}</div>}
      {settingsOpen && <SettingsDrawer soundOn={soundOn} reducedMotion={reducedMotion} onSound={setSoundOn} onMotion={setReducedMotion} onClose={() => setSettingsOpen(false)} onReset={resetProgress} />}
    </main>
  );
}

function TitleScreen({ hasProgress, completedCount, onStart, onContinue }: { hasProgress: boolean; completedCount: number; onStart: () => void; onContinue: () => void }) {
  const [hoveredTitan, setHoveredTitan] = useState<number>(0);
  const activeTitan = levels[hoveredTitan] ?? levels[0]!;

  return (
    <section className="sweep-in grid min-h-[calc(100vh-130px)] items-center gap-8 lg:grid-cols-[1fr_1.1fr] py-6">
      <div className="relative z-10 max-w-xl py-4 space-y-6">
        <div className="inline-flex items-center gap-2 border-l-2 border-primary px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[.2em] text-[#60e1d5]">
          <span className="size-2 animate-pulse rounded-full bg-[#60e1d5]" />
          Operation: Restore the Grid
        </div>

        <h1 className="display-font text-4xl sm:text-6xl font-extrabold leading-[1.08] text-white">
          Transaction<br />
          <span className="text-[#60e1d5]">Titans</span>
          <span className="text-[#ff6164]">:</span><br />
          <span className="text-xl sm:text-3xl font-semibold text-[#defcf9]/80 font-sans">
            The Valuation Force
          </span>
        </h1>

        <p className="text-sm sm:text-base leading-relaxed text-[#defcf9]/70">
          The Valuation Grid has fallen dark. Four sectors. Four Titans. Choose your path, master M&A deal valuation through video briefings, and light the Core.
        </p>

        {/* Interactive Steps Cues */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg border border-[#00959a]/40 bg-[#034a52]/50">
            <span className="text-base block mb-0.5">📹</span>
            <span className="text-[10px] font-mono uppercase text-[#60e1d5] font-bold">Watch</span>
          </div>
          <div className="p-2.5 rounded-lg border border-[#00959a]/40 bg-[#034a52]/50">
            <span className="text-base block mb-0.5">👆</span>
            <span className="text-[10px] font-mono uppercase text-[#ff6164] font-bold">Answer</span>
          </div>
          <div className="p-2.5 rounded-lg border border-[#00959a]/40 bg-[#034a52]/50">
            <span className="text-base block mb-0.5">⚡</span>
            <span className="text-[10px] font-mono uppercase text-[#ffac88] font-bold">Power Up</span>
          </div>
          <div className="p-2.5 rounded-lg border border-[#00959a]/40 bg-[#034a52]/50">
            <span className="text-base block mb-0.5">🏆</span>
            <span className="text-[10px] font-mono uppercase text-[#60e1d5] font-bold">Arena</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={onStart}
            className="h-12 px-7 rounded-xl bg-[#60e1d5] text-[#02373d] hover:bg-[#defcf9] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#60e1d5]/25 gap-2"
          >
            <Sparkles className="size-4" />
            {hasProgress ? "Deploy to Mission" : "Start Mission"}
            <ArrowRight className="size-4" />
          </Button>

          {hasProgress && (
            <Button
              variant="outline"
              onClick={onContinue}
              className="h-12 px-5 rounded-xl border-[#00959a] text-[#defcf9] hover:bg-[#034a52] text-xs font-bold uppercase tracking-wider"
            >
              Resume Grid · {completedCount}/4 Restored
            </Button>
          )}

          <Link
            to="/minimal"
            className="h-12 px-5 rounded-xl border border-[#ff6164]/60 bg-[#ff6164]/10 hover:bg-[#ff6164]/20 text-[#ff6164] flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span>🎮 Minimal Edition</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#defcf9]/60">
          <Headphones className="size-4 text-[#60e1d5]" />
          <span>Interactive sound effects & tactical valuation missions</span>
        </div>
      </div>

      {/* Right Interactive Hex Core with Avatars on Hover */}
      <div className="relative flex flex-col items-center justify-center p-4">
        {/* Orbital Background Rings */}
        <div className="absolute size-[340px] sm:size-[440px] rounded-full border border-[#00959a]/20 animate-[spin_60s_linear_infinite]" />
        <div className="absolute size-[260px] sm:size-[340px] rounded-full border border-dashed border-[#60e1d5]/20 animate-[spin_40s_linear_infinite_reverse]" />

        {/* Central Stand / Active Titan Hologram */}
        <div className="relative flex flex-col items-center justify-center min-h-[340px] w-full">
          {activeTitan.avatarImage && (
            <div className="relative h-64 sm:h-80 w-56 flex items-center justify-center animate-in zoom-in-95 duration-300">
              <div className="absolute bottom-2 size-40 rounded-full bg-gradient-to-t from-[#60e1d5]/30 to-transparent blur-xl pointer-events-none" />
              <img
                src={activeTitan.avatarImage}
                alt={activeTitan.hero}
                className="relative h-full w-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              />
            </div>
          )}

          {/* Active Titan Info Badge */}
          <div className="mt-2 text-center p-3 rounded-xl border border-[#00959a]/50 bg-[#034a52]/80 backdrop-blur max-w-xs shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#60e1d5] font-bold block">
              Sector 0{activeTitan.number} Titan
            </span>
            <span className="font-bold text-white text-base block">{activeTitan.hero}</span>
            <span className="text-[11px] text-[#defcf9]/70 block mt-0.5">{activeTitan.shortTitle}</span>
          </div>
        </div>

        {/* 4 Interactive Titan Selector Buttons Around Core */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {levels.map((lvl, idx) => {
            const isHovered = hoveredTitan === idx;
            return (
              <button
                key={lvl.number}
                onMouseEnter={() => setHoveredTitan(idx)}
                onClick={() => setHoveredTitan(idx)}
                className={`px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-2 text-xs font-bold ${
                  isHovered
                    ? "border-[#60e1d5] bg-[#034a52] text-white shadow-[0_0_15px_rgba(96,225,213,0.35)] scale-105"
                    : "border-[#034a52] bg-[#02373d]/80 text-[#defcf9]/70 hover:border-[#00959a]"
                }`}
              >
                <span className="text-base">{lvl.emblem}</span>
                <span>{lvl.hero}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StoryScreen({ panel, onNext, onSkip }: { panel: number; onNext: () => void; onSkip: () => void }) {
  const scenes = [
    { label: "01 · THE FRACTURE", title: "The Grid went dark.", copy: "The Valuation Grid has been divided into four sectors. The force that connected each deal, multiple and source is gone.", icon: <span className="display-font text-7xl text-energy">⌬</span> },
    { label: "02 · THE GUARDIANS", title: "Four Titans hold the line.", copy: "Comp Scout. Deal Shaper. Multiple Master. Source Guardian. Each guards a sector of the valuation force.", icon: <div className="grid grid-cols-2 gap-3 text-3xl"><span className="text-hero-cyan">⌕</span><span className="text-hero-coral">⇄</span><span className="text-hero-gold">×</span><span className="text-hero-mint">▤</span></div> },
    { label: "03 · THE COMMANDER", title: "You are the fifth.", copy: "Watch the mission briefing. Answer the call. Earn each power badge and light the Grid. Restore all four sectors to open the Final Assessment Arena.", icon: <Shield className="size-20 text-primary" /> },
  ];
  const scene = scenes[panel] ?? scenes[0]!;
  return <section className="sweep-in mx-auto grid min-h-[72vh] max-w-5xl items-center gap-8 py-12 md:grid-cols-[.85fr_1.15fr]"><div className="glass-panel relative flex min-h-72 items-center justify-center overflow-hidden"><div className="absolute inset-0 grid-world opacity-70" /><div className="relative">{scene.icon}</div><div className="absolute bottom-4 left-5 text-[10px] font-bold uppercase tracking-[.18em] text-energy">Transmission {String(panel + 1).padStart(2, "0")}</div></div><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">{scene.label}</p><h1 className="display-font mt-4 text-4xl font-bold sm:text-5xl">{scene.title}</h1><p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">{scene.copy}</p><div className="mt-7 flex gap-2" aria-label={`Story panel ${panel + 1} of 3`}>{scenes.map((_, index) => <span key={index} className={`h-1 w-10 ${index <= panel ? "bg-primary" : "bg-muted"}`} />)}</div><div className="mt-8 flex gap-3"><Button onClick={onNext} className="rounded-sm px-6 text-xs font-bold uppercase tracking-[.12em]">{panel === 2 ? "Enter the Grid" : "Continue"}<ArrowRight className="size-4" /></Button><Button variant="ghost" onClick={onSkip} className="rounded-sm text-xs uppercase tracking-[.1em] text-muted-foreground">Skip</Button></div></div></section>;
}

function HubScreen({ progress, statuses, restored, xp, arenaOpen, onSelect }: { progress: GameProgress; statuses: GameProgress["levels"][number]["status"][]; restored: number; xp: number; arenaOpen: boolean; onSelect: (index: number) => void }) {
  const inProgress = progress.levels.findIndex((item) => item.status === "in_progress");
  const nextAvailable = progress.levels.findIndex((item) => item.status === "available");
  const focusIndex = inProgress >= 0 ? inProgress : nextAvailable;
  const focus = (focusIndex >= 0 ? levels[focusIndex] : undefined) ?? levels[0]!;

  return (
    <section className="sweep-in max-w-6xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#034a52] pb-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[.2em] text-[#60e1d5]">Mission Control · Valuation Grid</p>
          <h1 className="display-font mt-1 text-2xl sm:text-3xl font-extrabold text-white">Welcome back, Commander.</h1>
          <p className="mt-1 text-xs text-[#defcf9]/70">The Grid is {restored}% restored. {arenaOpen ? "The Arena is ready." : "Your next sector is waiting."}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <StatChip icon={<Sparkles className="size-3.5 text-[#60e1d5]" />} label="Force XP" value={xp.toLocaleString()} />
          <StatChip icon={<BadgeCheck className="size-3.5 text-[#ffac88]" />} label="Badges" value={`${progress.badges.length}/4`} />
        </div>
      </div>

      {/* Game Overview Interactive Titan Dialogue Guide (Cookie Run Kingdom / RPG style) */}
      <InteractiveTitanGuide onSelectSector={onSelect} />

      {/* Main Grid View: Left Map, Right Focus Hero Preview */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="display-font text-sm font-semibold uppercase tracking-wider text-white">Sector Map</h2>
            <span className="text-[11px] font-mono text-[#60e1d5]">Select a sector to deploy</span>
          </div>
          <GridMap statuses={statuses} badges={progress.badges} onSelect={onSelect} arenaUnlocked={arenaOpen} />
        </div>

        {/* Right Active Preview */}
        <div className="space-y-4">
          <div className="glass-panel relative overflow-hidden rounded-2xl p-6 border border-[#00959a]/50 bg-[#034a52]/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[.18em] text-[#60e1d5]">
                {focusIndex >= 0 ? `Sector 0${focus.number} • ${focus.hero}` : "All sectors restored"}
              </span>
              <Flame className="size-4 text-[#ff6164]" />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
              <HeroFigure level={focus} compact />
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="display-font text-2xl font-bold text-white">{focus.hero}</h3>
                <p className="text-xs font-semibold text-[#60e1d5]">{focus.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#defcf9]/70">{focus.goal}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {focus.callouts.map((term) => (
                <span key={term} className="border border-[#00959a]/40 bg-[#02373d]/80 px-2.5 py-1 text-[10px] font-mono text-[#defcf9]/80 rounded-md">
                  {term}
                </span>
              ))}
            </div>

            {focusIndex >= 0 ? (
              <Button onClick={() => onSelect(focusIndex)} className="mt-6 w-full rounded-lg bg-[#60e1d5] text-[#02373d] hover:bg-[#defcf9] font-bold text-xs uppercase tracking-wider py-5 shadow-lg shadow-[#60e1d5]/20">
                {inProgress >= 0 ? "Resume Mission" : "Deploy into Sector"}
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            ) : (
              <Button onClick={() => onSelect(4)} disabled={!arenaOpen} className="mt-6 w-full rounded-lg bg-[#ff6164] text-white hover:bg-[#ff7c6b] font-bold text-xs uppercase tracking-wider py-5">
                {arenaOpen ? "Enter Final Arena" : "All Sectors Complete"}
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            )}
          </div>

          {/* Progress bar */}
          <div className="p-4 rounded-xl border border-[#034a52] bg-[#034a52]/30 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#defcf9]/70">Grid Restoration</span>
              <span className="text-[#60e1d5] font-bold">{restored}%</span>
            </div>
            <Progress value={restored} className="h-1.5 bg-[#02373d]" />
          </div>
        </div>
      </div>
    </section>
  );
}
function completedCountSafe(progress: GameProgress) { return progress.levels.filter((item) => item.status === "complete").length; }
function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-center gap-2 border border-border bg-card/70 px-3 py-2"><span>{icon}</span><span><span className="block text-[9px] uppercase tracking-[.12em] text-muted-foreground">{label}</span><span className="block text-xs font-bold tabular-nums">{value}</span></span></div>; }

function LevelGate({ level, status, onBack, onStart, onReplay, watched }: { level: GameLevel; status: string; onBack: () => void; onStart: () => void; onReplay: () => void; watched: boolean }) {
  return <section className="sweep-in mx-auto max-w-5xl py-4"><Button variant="ghost" onClick={onBack} className="mb-5 -ml-3 text-xs uppercase tracking-[.12em] text-muted-foreground"><ArrowLeft className="size-4" />Grid</Button><div className="glass-panel relative overflow-hidden"><div className="absolute inset-0 grid-world opacity-55" /><div className={`absolute -right-10 top-0 h-full w-1/3 skew-x-[-18deg] opacity-10 ${level.hue === "cyan" ? "bg-hero-cyan" : level.hue === "coral" ? "bg-hero-coral" : level.hue === "gold" ? "bg-hero-gold" : "bg-hero-mint"}`} /><div className="relative grid items-center gap-5 p-5 sm:grid-cols-[.8fr_1.2fr] sm:p-10"><div className="flex justify-center"><HeroFigure level={level} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Sector 0{level.number} · {level.hero}</p><h1 className="display-font mt-3 text-3xl font-bold sm:text-4xl">{level.title}</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">{level.goal}</p><div className="mt-5 flex flex-wrap gap-2">{level.callouts.map((term) => <span key={term} className="border border-border bg-background/60 px-3 py-1.5 text-[10px] font-medium text-foreground/80">{term}</span>)}</div><div className="mt-7 flex flex-wrap items-center gap-3"><Button onClick={onStart} className="h-11 rounded-sm px-6 text-xs font-bold uppercase tracking-[.13em]">{watched ? "Replay briefing" : "Start mission"}<ArrowRight className="size-4" /></Button>{watched && <Button variant="outline" onClick={onReplay} className="h-11 rounded-sm text-xs uppercase tracking-[.1em]"><RotateCcw className="size-4" /> Replay video</Button>}<span className="text-[10px] capitalize text-muted-foreground">{status.replace("_", " ")}</span></div></div></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="border-t border-border/70 pt-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Mission learning goal</p><p className="mt-2 text-sm leading-6">{level.goal}</p></div><div className="border-t border-border/70 pt-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Sector badge</p><p className="mt-2 flex items-center gap-2 text-sm"><Award className={`size-4 ${level.hue === "cyan" ? "text-hero-cyan" : level.hue === "coral" ? "text-hero-coral" : level.hue === "gold" ? "text-hero-gold" : "text-hero-mint"}`} />{level.hero} Power Badge · 4/5 to earn</p></div></div></section>;
}

function VideoStage({ level, elapsed, playing, captions, watched, onBack, onPlay, onReplay, onCaptions, onWatched }: { level: GameLevel; elapsed: number; playing: boolean; captions: boolean; watched: boolean; onBack: () => void; onPlay: () => void; onReplay: () => void; onCaptions: () => void; onWatched: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(25);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsVideoPlaying(false);
  };

  const activeElapsed = level.videoSrc ? currentTime : elapsed;
  const activeDuration = level.videoSrc ? duration : 25;
  const progressPct = activeDuration > 0 ? Math.min(100, (activeElapsed / activeDuration) * 100) : 0;
  const canMarkWatched = activeElapsed >= 5 || watched;

  const togglePlay = () => {
    if (level.videoSrc && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
    onPlay();
  };

  const handleReplayClick = () => {
    if (level.videoSrc && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    }
    onReplay();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <section className="sweep-in mx-auto max-w-5xl py-4">
      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-3 text-xs uppercase tracking-[.12em] text-muted-foreground">
        <ArrowLeft className="size-4" />Mission gate
      </Button>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Sector 0{level.number} · Field briefing</p>
          <h1 className="display-font mt-1 text-2xl font-bold">{level.title}</h1>
        </div>
        <span className="border border-border px-3 py-1.5 text-[10px] uppercase tracking-[.12em] text-muted-foreground">
          {level.videoSrc ? "Briefing video" : "Placeholder video"} · {formatTime(Math.max(0, activeDuration - activeElapsed))}
        </span>
      </div>
      <div className="glass-panel relative overflow-hidden">
        <div className="relative aspect-video w-full overflow-hidden bg-background/90">
          {level.videoSrc ? (
            <video
              ref={videoRef}
              src={level.videoSrc}
              className="size-full object-contain bg-black"
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={handleEnded}
              onClick={togglePlay}
            />
          ) : (
            <div className="relative grid size-full place-items-center overflow-hidden bg-background/65">
              <div className="absolute inset-0 grid-world opacity-80" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,oklch(0.4_0.12_195/25%),transparent_55%)]" />
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-5 flex size-20 items-center justify-center rounded-full border border-energy/60 bg-background/70 text-energy shadow-[0_0_35px_color-mix(in_oklab,var(--energy)_23%,transparent)]">
                  <AudioLines className="size-8" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-energy">Mission briefing · Video placeholder</p>
                <h2 className="display-font mt-3 max-w-lg px-3 text-xl font-bold sm:text-3xl">{level.title}</h2>
                {captions && <p className="mt-3 max-w-lg px-4 text-sm text-muted-foreground">{level.callouts[(Math.floor(elapsed / 7)) % level.callouts.length]}</p>}
              </div>
            </div>
          )}

          {/* Captions overlay if enabled and video has callouts */}
          {captions && level.videoSrc && (
            <div className="pointer-events-none absolute bottom-14 left-4 right-4 text-center">
              <span className="inline-block rounded bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm border border-border/50">
                {level.callouts[(Math.floor(activeElapsed / 7)) % level.callouts.length]}
              </span>
            </div>
          )}

          {/* Video control bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              aria-label={(level.videoSrc ? isVideoPlaying : playing) ? "Pause briefing" : "Play briefing"}
            >
              {(level.videoSrc ? isVideoPlaying : playing) ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <div
              className="h-1.5 flex-1 cursor-pointer overflow-hidden rounded bg-secondary/80"
              onClick={(e) => {
                if (level.videoSrc && videoRef.current && activeDuration > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  videoRef.current.currentTime = pos * activeDuration;
                }
              }}
            >
              <div className="h-full bg-energy transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground whitespace-nowrap">
              {formatTime(activeElapsed)} / {formatTime(activeDuration)}
            </span>
            <Button variant="ghost" size="icon" onClick={handleReplayClick} aria-label="Replay briefing">
              <RotateCcw className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCaptions}
              aria-label={captions ? "Turn captions off" : "Turn captions on"}
              title="Captions"
              className={captions ? "text-primary font-bold" : "text-muted-foreground"}
            >
              CC
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => {
                if (level.videoSrc && videoRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                  } else {
                    videoRef.current.requestFullscreen().catch(() => {});
                  }
                }
              }}
              aria-label="Fullscreen"
            >
              <Maximize2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold">Mission terms</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{level.callouts.join(" · ")}</p>
          </div>
          <Button onClick={onWatched} disabled={!canMarkWatched} className="rounded-sm text-xs font-bold uppercase tracking-[.1em]">
            {watched ? "Continue to knowledge check" : "Mark as watched"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        {level.videoSrc ? "Watch the briefing to prepare for your mission check." : "Play the briefing or wait 5 seconds to continue."}
      </p>
    </section>
  );
}

function QuizStage({ level, question, index, selected, answered, retryUsed, streak, onSelect, onSubmit, onAdvance }: { level: GameLevel; question: GameQuestion; index: number; selected: string[]; answered: boolean | null; retryUsed: boolean; streak: number; onSelect: (answer: string) => void; onSubmit: () => void; onAdvance: () => void }) {
  return <section className="sweep-in mx-auto max-w-3xl py-4"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center border border-energy/40 bg-accent/60 text-energy">{level.emblem}</div><span><span className="block text-[10px] font-bold uppercase tracking-[.15em] text-primary">Knowledge check</span><span className="block text-xs text-muted-foreground">{level.hero}</span></span></div><div className="flex items-center gap-3"><span className="text-xs tabular-nums text-muted-foreground">{index + 1} / 5</span>{streak >= 2 && <span className="flex items-center gap-1 text-xs font-bold text-hero-coral"><Flame className="size-4" />{streak}</span>}</div></div><Progress value={((index + 1) / 5) * 100} className="mb-6 h-1 bg-secondary" /><div className="glass-panel p-5 sm:p-8"><div className="flex items-start justify-between gap-4"><h1 className="display-font max-w-2xl text-xl font-bold leading-snug sm:text-2xl">{question.stem}</h1><CircleHelp className="mt-1 size-5 shrink-0 text-muted-foreground" /></div>{question.type === "multi" && <p className="mt-3 text-xs text-muted-foreground">Select every correct answer.</p>}<div className="mt-6 grid gap-3">{question.options.map((option, index) => {
    const isSelected = selected.includes(option);
    const isCorrectChoice = question.correctAnswers.includes(option);
    const showStatus = answered !== null;
    const stateClass = showStatus && isCorrectChoice ? "border-hero-mint/60 bg-hero-mint/10" : showStatus && isSelected && !isCorrectChoice ? "border-destructive/60 bg-destructive/10" : isSelected ? "border-primary/70 bg-primary/10" : "border-border bg-background/45 hover:border-energy/50 hover:bg-accent/55";
    return <button key={option} onClick={() => onSelect(option)} disabled={answered !== null} className={`group flex min-h-14 w-full items-center gap-3 border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 ${stateClass}`}><span className={`flex size-7 shrink-0 items-center justify-center border text-[10px] font-bold ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>{String.fromCharCode(65 + index)}</span><span className="flex-1 text-sm leading-5">{option}</span>{showStatus && isCorrectChoice && <Check className="size-4 shrink-0 text-hero-mint" aria-label="Correct choice" />}{showStatus && isSelected && !isCorrectChoice && <X className="size-4 shrink-0 text-destructive" aria-label="Incorrect choice" />}</button>;
  })}</div>{answered !== null && <div role="status" className={`mt-5 border-l-2 p-4 ${answered ? "border-hero-mint bg-hero-mint/5" : "border-hero-coral bg-hero-coral/5"}`}><p className="flex items-center gap-2 text-sm font-semibold">{answered ? <><Check className="size-4 text-hero-mint" />Correct. You are ready to continue.</> : <><RotateCcw className="size-4 text-hero-coral" />{retryUsed ? "Not quite — review the concept." : "Not quite — one retry available."}</>}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{question.explanation}</p>{question.type === "multi" && <p className="mt-2 text-xs text-muted-foreground">Correct choices are marked with a check; incorrect selections show an X.</p>}</div>}<div className="mt-6 flex justify-end">{answered === null ? <Button onClick={onSubmit} disabled={selected.length === 0} className="rounded-sm px-6 text-xs font-bold uppercase tracking-[.12em]">Submit answer<ArrowRight className="size-4" /></Button> : <Button onClick={onAdvance} className="rounded-sm px-6 text-xs font-bold uppercase tracking-[.12em]">{!answered && !retryUsed ? "Try once more" : index === 4 ? "Finish mission" : "Next question"}<ArrowRight className="size-4" /></Button>}</div></div><p className="mt-4 text-center text-[10px] text-muted-foreground">Pass mark · 4 / 5</p></section>;
}

function UnlockScreen({ level, score, allComplete, onContinue, onArena }: { level: GameLevel; score: number; allComplete: boolean; onContinue: () => void; onArena: () => void }) {
  return <section className="sweep-in mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center py-10 text-center"><div className="relative flex size-48 items-center justify-center rounded-full border border-primary/60 bg-primary/5 shadow-[0_0_90px_color-mix(in_oklab,var(--primary)_20%,transparent)] sm:size-60"><div className="absolute inset-4 rounded-full border border-dashed border-energy/50" /><div className="absolute inset-0 animate-ping rounded-full border border-energy/30 [animation-duration:2.3s]" /><HeroFigure level={level} compact /></div><div className="mt-7 flex flex-wrap justify-center gap-2">{[0, 1, 2, 3, 4].map((item) => <span key={item} className={`size-2 rounded-full ${item < score ? "bg-hero-gold shadow-[0_0_12px_var(--hero-gold)]" : "bg-muted"}`} />)}</div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.2em] text-primary">Mission unlocked · Badge earned</p><h1 className="display-font mt-2 text-3xl font-bold sm:text-5xl">{level.hero}</h1><p className="mt-3 text-sm text-muted-foreground">Sector 0{level.number} restored · {score}/5</p>{allComplete && <div className="mt-6 border border-primary/40 bg-primary/5 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-primary">Four-badge sequence complete</p><p className="display-font mt-2 text-xl font-bold">Final Assessment Arena unlocked</p></div>}<Button onClick={allComplete ? onArena : onContinue} className="mt-7 h-11 rounded-sm px-7 text-xs font-bold uppercase tracking-[.12em]">{allComplete ? "Enter the Arena" : "Continue to the Grid"}<ArrowRight className="size-4" /></Button><div className="mt-5 flex justify-center gap-2 text-xl text-hero-gold">{levels.map((item) => <span key={item.number} className={item.number <= level.number ? "opacity-100" : "opacity-20"}>{item.emblem}</span>)}</div></section>;
}

function ArenaStage({ question, index, selected, answered, retryUsed, arenaAnswers, onSelect, onSubmit, onAdvance }: { question: GameQuestion; index: number; selected: string[]; answered: boolean | null; retryUsed: boolean; arenaAnswers: boolean[]; onSelect: (answer: string) => void; onSubmit: () => void; onAdvance: () => void }) {
  const mastery = Math.round((arenaAnswers.filter(Boolean).length / arenaQuestions.length) * 100);
  return <section className="sweep-in mx-auto max-w-3xl py-4"><div className="mb-6 flex items-center justify-between"><Button variant="ghost" onClick={() => window.history.back()} className="-ml-3 text-xs uppercase tracking-[.12em] text-muted-foreground"><ArrowLeft className="size-4" />Exit arena</Button><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-primary"><LockKeyhole className="size-4" />Final Assessment Arena</span></div><div className="mb-5 border border-primary/35 bg-primary/5 p-4"><div className="mb-2 flex justify-between text-xs"><span className="font-semibold">Mastery Meter</span><span className="tabular-nums text-primary">{mastery}%</span></div><Progress value={mastery} className="h-2 bg-secondary" /></div><div className="mb-4 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-energy">Arena Challenge · {question.id}</p><span className="text-xs tabular-nums text-muted-foreground">{index + 1} / 5</span></div><QuizStage level={levels[3]!} question={question} index={index} selected={selected} answered={answered} retryUsed={retryUsed} streak={0} onSelect={onSelect} onSubmit={onSubmit} onAdvance={onAdvance} /></section>;
}

function ArenaResults({ score, name, onName, onContinue }: { score: number; name: string; onName: (name: string) => void; onContinue: () => void }) {
  const passed = score >= ARENA_PASS_MARK;
  return <section className="sweep-in mx-auto flex min-h-[68vh] max-w-3xl flex-col items-center justify-center py-8 text-center"><div className={`flex size-24 items-center justify-center rounded-full border ${passed ? "border-primary/60 bg-primary/10 text-primary" : "border-destructive/60 bg-destructive/10 text-destructive"}`}>{passed ? <Award className="size-12" /> : <RotateCcw className="size-10" />}</div><p className="mt-6 text-[10px] font-bold uppercase tracking-[.2em] text-primary">Final Assessment Arena</p><h1 className="display-font mt-2 text-4xl font-bold">{passed ? "Grid restored." : "The Arena awaits."}</h1><p className="mt-3 text-muted-foreground">Final score · <span className="font-bold text-foreground">{score}/5</span> · Pass mark 4/5</p>{passed ? <><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">The four sectors are joined. Enter your name for the Valuation Force Commander certificate.</p><Input value={name} onChange={(event) => onName(event.target.value)} maxLength={48} placeholder="Commander name" aria-label="Commander name for certificate" className="mt-6 max-w-sm rounded-sm border-border bg-card" /><Button onClick={onContinue} className="mt-4 rounded-sm px-7 text-xs font-bold uppercase tracking-[.12em]">View certificate<ArrowRight className="size-4" /></Button></> : <><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Review the explanations and return to the Arena when ready.</p><Button onClick={onContinue} className="mt-6 rounded-sm px-7 text-xs font-bold uppercase tracking-[.12em]">Return to Grid<ArrowRight className="size-4" /></Button></>}</section>;
}

function Certificate({ name, score, onBack, onDownload }: { name: string; score: number; onBack: () => void; onDownload: () => void }) {
  return <section className="sweep-in mx-auto max-w-4xl py-5"><Button variant="ghost" onClick={onBack} className="mb-5 -ml-3 text-xs uppercase tracking-[.12em] text-muted-foreground"><ArrowLeft className="size-4" />Grid</Button><div className="relative overflow-hidden border-2 border-energy/60 bg-card p-1"><div className="border border-primary/50"><div className="grid-world flex min-h-[460px] flex-col items-center justify-center px-5 py-12 text-center sm:min-h-[560px]"><FileBadge className="size-10 text-energy" /><p className="mt-5 text-[10px] font-bold uppercase tracking-[.25em] text-energy">The Valuation Force</p><h1 className="display-font mt-4 text-3xl font-extrabold text-primary sm:text-5xl">Certificate of Mastery</h1><p className="mt-8 text-sm text-muted-foreground">This certifies that</p><p className="display-font mt-3 max-w-full break-words text-2xl font-bold sm:text-4xl">{name || "Valuation Force Commander"}</p><p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">has restored the Valuation Grid and completed the Final Assessment Arena.</p><div className="mt-7 flex gap-3 text-2xl text-hero-gold" aria-label="Four power badges and the final mastery badge">{levels.map((level) => <span key={level.number}>{level.emblem}</span>)}<span>✦</span></div><p className="mt-6 text-xs uppercase tracking-[.14em] text-primary">Final score {score}/5 · {new Date().toLocaleDateString()}</p></div></div></div><div className="mt-5 flex flex-wrap justify-center gap-3"><Button onClick={onDownload} className="rounded-sm px-6 text-xs font-bold uppercase tracking-[.12em]"><FileBadge className="size-4" />Download PNG</Button><Button variant="outline" onClick={() => window.print()} className="rounded-sm text-xs uppercase tracking-[.1em]">Print certificate</Button></div></section>;
}

function SettingsDrawer({ soundOn, reducedMotion, onSound, onMotion, onClose, onReset }: { soundOn: boolean; reducedMotion: boolean; onSound: (value: boolean) => void; onMotion: (value: boolean) => void; onClose: () => void; onReset: () => void }) {
  const settingsItems = [
    { label: "Sound effects", checked: soundOn, onChange: onSound, icon: <Volume2 className="size-4" /> },
    { label: "Reduced motion", checked: reducedMotion, onChange: onMotion, icon: <Sparkles className="size-4" /> },
  ];
  return <div className="fixed inset-0 z-50 flex justify-end bg-background/75 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside role="dialog" aria-modal="true" aria-labelledby="settings-title" className="h-full w-full max-w-sm border-l border-border bg-card p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Commander</p><h2 id="settings-title" className="display-font mt-1 text-xl font-bold">Settings</h2></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings"><X /></Button></div><div className="mt-8 divide-y divide-border/70 border-y border-border/70">{settingsItems.map(({ label, checked, onChange, icon }) => <div key={label} className="flex items-center justify-between py-4"><span className="flex items-center gap-3 text-sm">{icon}{label}</span><button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 border transition-colors ${checked ? "border-primary bg-primary" : "border-border bg-secondary"}`}><span className={`absolute top-0.5 size-4 bg-background transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} /></button></div>)}</div><div className="mt-7"><p className="text-xs leading-5 text-muted-foreground">Reset removes saved mission progress and earned badges from this device.</p><Button variant="outline" onClick={onReset} className="mt-4 w-full rounded-sm border-destructive/40 text-destructive hover:bg-destructive/10"><RotateCcw className="size-4" />Reset progress</Button></div><Button variant="ghost" onClick={onClose} className="mt-5 w-full rounded-sm text-xs uppercase tracking-[.1em]">Close</Button></aside></div>;
}