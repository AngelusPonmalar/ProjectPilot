import { useEffect, useState } from "react";

type Trail = { id: number; x: number; y: number; size: number; rot: number };

export function CursorHearts() {
  const [trail, setTrail] = useState<Trail[]>([]);

  useEffect(() => {
    let id = 0;
    let last = 0;
    const spawn = (x: number, y: number) => {
      const now = performance.now();
      if (now - last < 55) return;
      last = now;
      const t: Trail = {
        id: id++,
        x,
        y,
        size: 10 + Math.random() * 14,
        rot: Math.random() * 60 - 30,
      };
      setTrail((prev) => [...prev.slice(-14), t]);
      window.setTimeout(() => setTrail((prev) => prev.filter((p) => p.id !== t.id)), 900);
    };
    const onMove = (e: MouseEvent) => spawn(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) spawn(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {trail.map((t) => (
        <svg
          key={t.id}
          viewBox="0 0 100 92"
          width={t.size}
          height={t.size}
          className="absolute animate-out fade-out zoom-out-50 duration-[900ms]"
          style={{ left: t.x - t.size / 2, top: t.y - t.size / 2, rotate: `${t.rot}deg` }}
        >
          <path
            d="M50 88 C 12 60, 0 38, 0 25 A 25 25 0 0 1 50 14 A 25 25 0 0 1 100 25 C 100 38, 88 60, 50 88 Z"
            fill="var(--blush)"
          />
        </svg>
      ))}
    </div>
  );
}
