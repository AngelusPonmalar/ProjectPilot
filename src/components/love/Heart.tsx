type HeartProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
};

export function Heart({ size = 40, className = "", style, glow }: HeartProps) {
  return (
    <svg
      viewBox="0 0 100 92"
      width={size}
      height={size * 0.92}
      className={className}
      style={{ filter: glow ? "drop-shadow(0 0 18px oklch(0.7 0.22 5 / 0.8))" : undefined, ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`hg-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--blush)" />
          <stop offset="55%" stopColor="var(--rose)" />
          <stop offset="100%" stopColor="var(--lilac)" />
        </linearGradient>
      </defs>
      <path
        d="M50 88 C 12 60, 0 38, 0 25 A 25 25 0 0 1 50 14 A 25 25 0 0 1 100 25 C 100 38, 88 60, 50 88 Z"
        fill={`url(#hg-${size})`}
      />
    </svg>
  );
}

export function CuteHeartChar({
  size = 90,
  flip = false,
  className = "",
}: {
  size?: number;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`chc-${size}-${flip ? 1 : 0}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--blush)" />
          <stop offset="100%" stopColor="var(--rose)" />
        </linearGradient>
      </defs>
      <path
        d="M50 82 C 16 58, 6 40, 6 28 A 22 22 0 0 1 50 18 A 22 22 0 0 1 94 28 C 94 40, 84 58, 50 82 Z"
        fill={`url(#chc-${size}-${flip ? 1 : 0})`}
      />
      <circle cx="36" cy="40" r="4.5" fill="oklch(0.15 0.05 320)" />
      <circle cx="64" cy="40" r="4.5" fill="oklch(0.15 0.05 320)" />
      <circle cx="37.5" cy="38.5" r="1.6" fill="white" />
      <circle cx="65.5" cy="38.5" r="1.6" fill="white" />
      <path
        d="M42 52 Q 50 60 58 52"
        stroke="oklch(0.15 0.05 320)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="26" cy="50" rx="6" ry="4" fill="oklch(0.75 0.2 20 / 0.55)" />
      <ellipse cx="74" cy="50" rx="6" ry="4" fill="oklch(0.75 0.2 20 / 0.55)" />
    </svg>
  );
}
