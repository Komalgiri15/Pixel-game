// Safe Text-to-Speech Engine with Complete SSR & Browser Safety Guards

class VoiceService {
  private enabled: boolean = false; // defaults to false initially until mounted/user enables
  private isSpeaking: boolean = false;
  private listeners: Set<(speaking: boolean) => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    // SSR Safe constructor - do not touch window or localStorage here
  }

  private init() {
    if (this.initialized) return;
    if (typeof window !== "undefined") {
      this.initialized = true;
      try {
        const stored = window.localStorage.getItem("valuation-voiceover-enabled");
        // default enabled on client if supported
        this.enabled = stored !== null ? stored === "true" : true;
      } catch {
        this.enabled = true;
      }
    }
  }

  public subscribe(cb: (speaking: boolean) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.isSpeaking);
      } catch {
        // safety
      }
    });
  }

  public isVoiceEnabled(): boolean {
    this.init();
    return this.enabled;
  }

  public setVoiceEnabled(value: boolean) {
    this.init();
    this.enabled = value;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("valuation-voiceover-enabled", String(value));
      } catch {}
      if (!value) {
        this.stop();
      }
    }
  }

  public toggleVoice(): boolean {
    this.init();
    this.setVoiceEnabled(!this.enabled);
    return this.enabled;
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
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
    this.init();
    if (!this.enabled) return;
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return;
    }

    const { character = "commander", interrupt = true, rate, pitch } = options;

    try {
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
      const voices = window.speechSynthesis.getVoices?.() || [];
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
        case "scout":
          utterance.rate = rate ?? 1.05;
          utterance.pitch = pitch ?? 1.15;
          break;
        case "shaper":
          utterance.rate = rate ?? 0.98;
          utterance.pitch = pitch ?? 0.95;
          break;
        case "master":
          utterance.rate = rate ?? 1.02;
          utterance.pitch = pitch ?? 1.0;
          break;
        case "guardian":
          utterance.rate = rate ?? 0.94;
          utterance.pitch = pitch ?? 0.85;
          break;
        case "system":
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

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          // Fallback if browser blocks audio autoplay
        }
      }, 50);
    } catch {
      // SpeechSynthesis not supported or blocked
    }
  }
}

export const voice = new VoiceService();
