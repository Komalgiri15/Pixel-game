// Voiceover & Text-to-Speech Engine using Web Speech Synthesis API
// Provides crisp, natural narration with Titan character pitch tuning and voice controls

class VoiceService {
  private enabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("valuation-voiceover-enabled");
      if (stored !== null) {
        this.enabled = stored === "true";
      }
    }
  }

  public subscribe(cb: (speaking: boolean) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isSpeaking));
  }

  public isVoiceEnabled(): boolean {
    return this.enabled;
  }

  public setVoiceEnabled(value: boolean) {
    this.enabled = value;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("valuation-voiceover-enabled", String(value));
      if (!value) {
        this.stop();
      }
    }
  }

  public toggleVoice(): boolean {
    this.setVoiceEnabled(!this.enabled);
    return this.enabled;
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.notify();
    }
  }

  /**
   * Speak narration text with optional character personality pitch & rate
   */
  public speak(
    text: string,
    options: {
      character?: "scout" | "shaper" | "master" | "guardian" | "commander" | "system";
      interrupt?: boolean;
      rate?: number;
      pitch?: number;
    } = {}
  ) {
    if (!this.enabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const { character = "commander", interrupt = true, rate, pitch } = options;

    if (interrupt) {
      window.speechSynthesis.cancel();
    }

    // Clean up emojis and Markdown markup for smooth speech
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[*_#`[\]()]/g, "")
      .replace(/·/g, ",")
      .replace(/→/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Voice selection: prioritize English natural / high-quality voices
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          (v.lang.startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Daniel") ||
              v.name.includes("Premium"))) ||
          v.lang.startsWith("en")
      ) ?? voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    // Character personality pitch & rate tuning:
    switch (character) {
      case "scout": // Aero / Comp Scout: energetic, sharp
        utterance.rate = rate ?? 1.05;
        utterance.pitch = pitch ?? 1.15;
        break;
      case "shaper": // Ignis / Deal Shaper: warm, confident
        utterance.rate = rate ?? 0.98;
        utterance.pitch = pitch ?? 0.95;
        break;
      case "master": // Quant / Multiple Master: precise, analytical
        utterance.rate = rate ?? 1.02;
        utterance.pitch = pitch ?? 1.0;
        break;
      case "guardian": // Aegis / Source Guardian: deep, authoritative
        utterance.rate = rate ?? 0.94;
        utterance.pitch = pitch ?? 0.85;
        break;
      case "system": // Mission announcer / AI HUD
        utterance.rate = rate ?? 1.1;
        utterance.pitch = pitch ?? 1.05;
        break;
      default:
        utterance.rate = rate ?? 1.0;
        utterance.pitch = pitch ?? 1.0;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notify();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.notify();
    };

    this.currentUtterance = utterance;

    // Small delay prevents voice synthesis drop in Chrome/Blink
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 40);
  }
}

export const voice = new VoiceService();
