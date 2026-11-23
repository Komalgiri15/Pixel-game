import React from "react";

// Animated moving SVGs matching the Teal & Coral palette (#60e1d5, #ff6164, #ffac88, #defcf9)

export function PointGestureSvg({ className = "size-16" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Target choice indicator that gets tapped */}
      <div className="absolute -top-1 size-8 rounded-lg border border-[#60e1d5]/50 bg-[#00959a]/20 flex items-center justify-center text-[10px] font-mono text-[#60e1d5] font-bold animate-[pulse_1.5s_ease-in-out_infinite]">
        [A]
      </div>
      <svg
        viewBox="0 0 100 100"
        className="size-full animate-[bounce_1.5s_ease-in-out_infinite]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow pulse circle */}
        <circle cx="50" cy="18" r="7" className="fill-[#60e1d5]/30 animate-ping" />
        {/* Pointing Index Finger */}
        <path
          d="M45 20 C45 15, 55 15, 55 20 L55 52 L55 60 C55 62, 53 64, 50 64 C47 64, 45 62, 45 60 Z"
          fill="#60e1d5"
          stroke="#02373d"
          strokeWidth="2.5"
        />
        {/* Curled Middle, Ring, Pinky */}
        <rect x="54" y="44" width="10" height="20" rx="5" fill="#00959a" stroke="#02373d" strokeWidth="2" />
        <rect x="63" y="48" width="9" height="17" rx="4.5" fill="#00959a" stroke="#02373d" strokeWidth="2" />
        <rect x="71" y="52" width="8" height="14" rx="4" fill="#034a52" stroke="#02373d" strokeWidth="2" />
        {/* Palm & Wrist */}
        <path
          d="M36 50 C36 44, 45 44, 45 52 L45 74 C45 84, 76 84, 76 70 L76 56"
          fill="#034a52"
          stroke="#60e1d5"
          strokeWidth="2.5"
        />
        {/* Thumb tucked */}
        <path d="M36 52 C30 56, 30 68, 42 66" fill="#60e1d5" stroke="#02373d" strokeWidth="2" />
        {/* Laser line pointing up */}
        <line x1="50" y1="12" x2="50" y2="2" stroke="#60e1d5" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
      </svg>
    </div>
  );
}

export function ThumbsUpGestureSvg({ className = "size-16" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Confirmation checkburst behind thumb */}
      <div className="absolute -top-1 -left-1 size-7 rounded-full bg-[#ff6164]/20 border border-[#ff6164]/60 flex items-center justify-center text-xs text-[#ff6164] font-bold animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]">
        ✓
      </div>
      <svg
        viewBox="0 0 100 100"
        className="size-full animate-[wiggle_2s_ease-in-out_infinite]"
        style={{
          animation: "thumbsUpFloat 2s ease-in-out infinite"
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`@keyframes thumbsUpFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(-8deg); }
          }`}
        </style>
        {/* Thumb pointing up */}
        <path
          d="M30 18 C30 12, 42 12, 42 18 L42 46 C42 48, 38 52, 36 52 L30 52 C26 52, 26 44, 26 38 Z"
          fill="#ff6164"
          stroke="#02373d"
          strokeWidth="2.5"
        />
        {/* Hand Fist */}
        <rect x="36" y="38" width="36" height="38" rx="10" fill="#034a52" stroke="#ff6164" strokeWidth="2.5" />
        {/* Curled Fingers Lines */}
        <line x1="42" y1="48" x2="68" y2="48" stroke="#ffac88" strokeWidth="3" strokeLinecap="round" />
        <line x1="42" y1="58" x2="68" y2="58" stroke="#ffac88" strokeWidth="3" strokeLinecap="round" />
        <line x1="42" y1="67" x2="64" y2="67" stroke="#ffac88" strokeWidth="3" strokeLinecap="round" />
        {/* Confirm sparkles */}
        <circle cx="22" cy="18" r="2.5" fill="#ffac88" />
        <circle cx="48" cy="10" r="3" fill="#ff6164" />
      </svg>
    </div>
  );
}

export function WaveGestureSvg({ className = "size-16" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="size-full"
        style={{
          transformOrigin: "bottom center",
          animation: "waveTilt 1.8s ease-in-out infinite"
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`@keyframes waveTilt {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-18deg); }
            75% { transform: rotate(18deg); }
          }`}
        </style>
        {/* Motion trail lines */}
        <path d="M12 28 C18 20, 30 20, 36 26" stroke="#60e1d5" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" strokeDasharray="3 3" />
        <path d="M68 24 C74 18, 86 18, 92 26" stroke="#60e1d5" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" strokeDasharray="3 3" />

        {/* 5 Open Fingers */}
        {/* Thumb */}
        <path d="M22 52 C16 46, 26 36, 32 44 L38 52" fill="#00959a" stroke="#02373d" strokeWidth="2" />
        {/* Index */}
        <rect x="34" y="16" width="9" height="40" rx="4.5" fill="#60e1d5" stroke="#02373d" strokeWidth="2" />
        {/* Middle */}
        <rect x="45" y="12" width="10" height="44" rx="5" fill="#60e1d5" stroke="#02373d" strokeWidth="2" />
        {/* Ring */}
        <rect x="57" y="16" width="9" height="40" rx="4.5" fill="#60e1d5" stroke="#02373d" strokeWidth="2" />
        {/* Pinky */}
        <rect x="68" y="24" width="8" height="32" rx="4" fill="#00959a" stroke="#02373d" strokeWidth="2" />

        {/* Palm */}
        <path
          d="M30 52 C30 46, 75 46, 75 52 L72 82 C72 86, 34 86, 34 82 Z"
          fill="#034a52"
          stroke="#60e1d5"
          strokeWidth="2.5"
        />
        {/* Palm life line */}
        <path d="M42 62 Q52 70 62 64" stroke="#00959a" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function VictoryGestureSvg({ className = "size-16" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Play / Pause toggle badge in background */}
      <div className="absolute -top-1 size-8 rounded-full bg-[#ffac88]/20 border border-[#ffac88]/60 flex items-center justify-center text-xs text-[#ffac88] font-bold animate-[pulse_2s_infinite]">
        ▶ ⏸
      </div>
      <svg
        viewBox="0 0 100 100"
        className="size-full"
        style={{
          animation: "peaceBob 2.2s ease-in-out infinite"
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`@keyframes peaceBob {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.06) translateY(-4px); }
          }`}
        </style>
        {/* V Fingers: Index & Middle */}
        {/* Index Finger (Angled left) */}
        <g transform="rotate(-15 44 48)">
          <rect x="38" y="14" width="11" height="42" rx="5.5" fill="#ffac88" stroke="#02373d" strokeWidth="2" />
        </g>
        {/* Middle Finger (Angled right) */}
        <g transform="rotate(15 56 48)">
          <rect x="52" y="14" width="11" height="42" rx="5.5" fill="#ffac88" stroke="#02373d" strokeWidth="2" />
        </g>

        {/* Curled Ring & Pinky */}
        <rect x="58" y="48" width="12" height="18" rx="6" fill="#00959a" stroke="#02373d" strokeWidth="2" />
        <rect x="67" y="52" width="10" height="15" rx="5" fill="#034a52" stroke="#02373d" strokeWidth="2" />

        {/* Thumb folded over ring finger */}
        <path d="M34 50 C26 56, 32 68, 56 62" fill="#ffac88" stroke="#02373d" strokeWidth="2" />

        {/* Hand Palm base */}
        <path
          d="M32 54 L34 82 C34 86, 68 86, 68 82 L70 56"
          fill="#034a52"
          stroke="#ffac88"
          strokeWidth="2.5"
        />
        {/* Energy beam between V fingers */}
        <line x1="42" y1="12" x2="58" y2="12" stroke="#60e1d5" strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}
