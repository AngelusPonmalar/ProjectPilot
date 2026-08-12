import { motion } from "motion/react";
import { useMemo } from "react";

export function HeartBurst({
  count = 90,
  spread = 520,
  duration = 2.2,
  fixed = false,
}: {
  count?: number;
  spread?: number;
  duration?: number;
  fixed?: boolean;
}) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random();
        const dist = spread * (0.35 + Math.random() * 0.75);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 8 + Math.random() * 22,
          rot: Math.random() * 360,
          delay: Math.random() * 0.35,
          star: i % 4 === 0,
        };
      }),
    [count, spread],
  );

  return (
    <div
      className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 z-40 flex items-center justify-center overflow-hidden`}
    >
      {bits.map((b, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.2, rotate: 0 }}
          animate={{ x: b.x, y: b.y, opacity: 0, scale: 1.1, rotate: b.rot }}
          transition={{ duration, delay: b.delay, ease: "easeOut" }}
        >
          {b.star ? (
            <svg viewBox="0 0 24 24" width={b.size} height={b.size}>
              <path
                d="M12 0 L14 9 L23 12 L14 15 L12 24 L10 15 L1 12 L10 9 Z"
                fill="var(--star)"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 100 92" width={b.size} height={b.size}>
              <path
                d="M50 88 C 12 60, 0 38, 0 25 A 25 25 0 0 1 50 14 A 25 25 0 0 1 100 25 C 100 38, 88 60, 50 88 Z"
                fill={i % 3 === 0 ? "var(--lilac)" : i % 3 === 1 ? "var(--rose)" : "var(--blush)"}
              />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
