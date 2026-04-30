"use client";

interface Props {
  message: string;
  thinking?: boolean;
}

export default function CatCompanion({ message, thinking }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* Speech bubble */}
      <div
        className="relative px-4 py-3 rounded-2xl text-sm max-w-[240px] text-center leading-relaxed"
        style={{
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          color: "var(--text)",
        }}
      >
        {thinking ? (
          <span className="flex gap-1 justify-center items-center h-5">
            <span className="dot-bounce" style={{ animationDelay: "0ms" }} />
            <span className="dot-bounce" style={{ animationDelay: "150ms" }} />
            <span className="dot-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        ) : (
          message
        )}
        {/* Bubble tail */}
        <span
          className="absolute left-1/2 -bottom-2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "8px solid var(--border)",
          }}
        />
        <span
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: "-6px",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "7px solid var(--surface2)",
          }}
        />
      </div>

      {/* Cat SVG */}
      <svg width="90" height="70" viewBox="0 0 90 70" fill="none">
        {/* Body */}
        <ellipse cx="45" cy="50" rx="28" ry="18" fill="#e8e8e8" />
        {/* Head */}
        <ellipse cx="45" cy="32" rx="20" ry="18" fill="#e8e8e8" />
        {/* Ears */}
        <polygon points="28,18 22,4 34,14" fill="#e8e8e8" />
        <polygon points="62,18 68,4 56,14" fill="#e8e8e8" />
        <polygon points="29,17 24,7 33,14" fill="#f4b8c1" />
        <polygon points="61,17 66,7 57,14" fill="#f4b8c1" />
        {/* Sunglasses */}
        <rect x="30" y="27" width="13" height="10" rx="5" fill="#1a1a1a" />
        <rect x="47" y="27" width="13" height="10" rx="5" fill="#1a1a1a" />
        <line x1="43" y1="32" x2="47" y2="32" stroke="#1a1a1a" strokeWidth="1.5" />
        {/* Nose */}
        <ellipse cx="45" cy="40" rx="2" ry="1.5" fill="#f4b8c1" />
        {/* Mouth */}
        <path d="M42 42 Q45 45 48 42" stroke="#888" strokeWidth="1" fill="none" />
        {/* Paws on ledge */}
        <ellipse cx="30" cy="64" rx="9" ry="5" fill="#e8e8e8" />
        <ellipse cx="60" cy="64" rx="9" ry="5" fill="#e8e8e8" />
        {/* Paw toes */}
        <ellipse cx="25" cy="64" rx="3" ry="2" fill="#d8d8d8" />
        <ellipse cx="30" cy="66" rx="3" ry="2" fill="#d8d8d8" />
        <ellipse cx="35" cy="64" rx="3" ry="2" fill="#d8d8d8" />
        <ellipse cx="55" cy="64" rx="3" ry="2" fill="#d8d8d8" />
        <ellipse cx="60" cy="66" rx="3" ry="2" fill="#d8d8d8" />
        <ellipse cx="65" cy="64" rx="3" ry="2" fill="#d8d8d8" />
      </svg>

      <style>{`
        .dot-bounce {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: bounce 0.9s infinite;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
