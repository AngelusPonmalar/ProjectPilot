import { useMemo } from "react";

const rand = (seed: number) => {
  const x = Math.sin(seed * 9973.13) * 10000;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
};

export function Starfield({ count = 70 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: rand(i + 1) * 100,
        top: rand(i + 51) * 100,
        size: Math.round((1 + rand(i + 101) * 2.6) * 100) / 100,
        delay: Math.round(rand(i + 151) * 500) / 100,
        dur: Math.round((2.5 + rand(i + 201) * 4) * 100) / 100,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            boxShadow: "0 0 6px oklch(0.95 0.06 95 / 0.9)",
          }}
        />
      ))}
    </div>
  );
}

export function FloatingHearts({ count = 18 }: { count?: number }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: rand(i + 7) * 100,
        size: Math.round(10 + rand(i + 77) * 26),
        delay: rand(i + 177) * 18,
        dur: 14 + rand(i + 277) * 16,
        op: 0.25 + rand(i + 377) * 0.5,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {hearts.map((h, i) => (
        <svg
          key={i}
          viewBox="0 0 100 92"
          width={h.size}
          height={h.size}
          className="absolute bottom-[-12vh]"
          style={{
            left: `${h.left}%`,
            opacity: h.op,
            animation: `floatUp ${h.dur}s linear ${h.delay}s infinite`,
          }}
        >
          <path
            d="M50 88 C 12 60, 0 38, 0 25 A 25 25 0 0 1 50 14 A 25 25 0 0 1 100 25 C 100 38, 88 60, 50 88 Z"
            fill="var(--rose)"
          />
        </svg>
      ))}
    </div>
  );
}

export function Clouds() {
  const clouds = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        top: 8 + rand(i + 3) * 55,
        scale: 0.6 + rand(i + 33) * 1.1,
        dur: 60 + rand(i + 63) * 60,
        delay: -rand(i + 93) * 60,
        op: 0.1 + rand(i + 123) * 0.12,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {clouds.map((c, i) => (
        <svg
          key={i}
          viewBox="0 0 200 80"
          width={260 * c.scale}
          className="absolute"
          style={{
            top: `${c.top}%`,
            opacity: c.op,
            animation: `drift ${c.dur}s linear ${c.delay}s infinite`,
          }}
        >
          <g fill="var(--blush)">
            <ellipse cx="60" cy="50" rx="45" ry="26" />
            <ellipse cx="105" cy="40" rx="38" ry="30" />
            <ellipse cx="145" cy="52" rx="35" ry="22" />
          </g>
        </svg>
      ))}
    </div>
  );
}

export function CursorHearts() {
  return null;
}
