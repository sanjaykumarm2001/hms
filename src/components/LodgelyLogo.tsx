export function LodgelyLogo({
  className = 'h-8 w-auto',
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg viewBox="10 10 140 90" className="h-8 w-8 shrink-0" aria-hidden="true">
          <defs>
            <linearGradient id="lodgelyGradCompact" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d9f99d" />
              <stop offset="40%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
          <circle cx="55" cy="55" r="42" fill="url(#lodgelyGradCompact)" />
          <path
            d="M 35 60 L 85 22 L 135 60"
            fill="none"
            stroke="#15803d"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="112" y="32" width="9" height="14" fill="#15803d" />
          <text x="42" y="85" fontFamily="serif" fontSize="48" fontWeight="bold" fill="#15803d">
            L
          </text>
          <text x="78" y="86" fontFamily="serif" fontSize="46" fontWeight="bold" fill="#15803d">
            G
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 160 140" className="h-9 w-auto shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="lodgelyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d9f99d" />
            <stop offset="40%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>

        {/* Gradient Sun/Circle */}
        <circle cx="55" cy="55" r="42" fill="url(#lodgelyGrad)" />

        {/* House Roof & Chimney */}
        <path
          d="M 35 60 L 85 22 L 135 60"
          fill="none"
          stroke="#15803d"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="112" y="32" width="9" height="14" fill="#15803d" />

        {/* LG Monogram */}
        <text
          x="42"
          y="85"
          fontFamily="serif"
          fontSize="48"
          fontWeight="bold"
          fill="#15803d"
        >
          L
        </text>
        <text
          x="78"
          y="86"
          fontFamily="serif"
          fontSize="46"
          fontWeight="bold"
          fill="#15803d"
        >
          G
        </text>

        {/* Horizontal Divider Line */}
        <line x1="20" y1="98" x2="145" y2="98" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />

        {/* LODGELY Subtitle */}
        <text
          x="28"
          y="120"
          fontFamily="serif"
          fontSize="20"
          fontWeight="600"
          letterSpacing="2.5"
          fill="#15803d"
        >
          LODGELY
        </text>
      </svg>
    </div>
  );
}
