import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Heart } from "./Heart";
import { Scene } from "./Typewriter";

const STEPS = [10, 30, 67, 100, 500, 9999];

export function SceneLoveCalculator() {
  const [value, setValue] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "loading" | "counting" | "error">("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const run = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPhase("loading");
    setValue(null);
    timers.current.push(
      window.setTimeout(() => {
        setPhase("counting");
        STEPS.forEach((s, i) => {
          timers.current.push(window.setTimeout(() => setValue(s), i * 550));
        });
        timers.current.push(
          window.setTimeout(() => setPhase("error"), STEPS.length * 550 + 400),
        );
      }, 1400),
    );
  };

  return (
    <Scene id="love-calculator">
      <h2 className="font-script text-5xl text-glow sm:text-6xl">How much do I love you?</h2>

      <div className="glass mt-10 w-full max-w-md rounded-3xl p-8">
        <div className="flex h-[170px] items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "loading" ? (
              <motion.div
                key="loading"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.6, opacity: 0, rotate: 20 }}
                className="relative"
              >
                <motion.span
                  className="block h-24 w-24 rounded-full border-4 border-blush/30 border-t-rose"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                />
                <span className="absolute inset-0 grid place-items-center">
                  <Heart size={34} />
                </span>
              </motion.div>
            ) : phase === "error" ? (
              <motion.div
                key="error"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, x: [0, -6, 6, -4, 0] }}
                transition={{ duration: 0.6 }}
                className="text-destructive"
              >
                <p className="text-4xl font-black">ERROR 🚨</p>
                <p className="mt-2 text-lg font-semibold text-blush">LOVE LEVEL TOO HIGH.</p>
              </motion.div>
            ) : value !== null ? (
              <motion.p
                key={value}
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="text-6xl font-black text-glow sm:text-7xl"
              >
                {value}%
              </motion.p>
            ) : (
              <motion.div key="idle" className="animate-beat">
                <Heart size={110} glow />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={run} className="glow-btn mt-6 w-full px-6 py-4 text-lg font-semibold">
          Calculate my love ❤️
        </button>

        <AnimatePresence>
          {phase === "error" && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 font-script text-3xl text-blush"
            >
              Please restart the girlfriend. 😭❤️
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </Scene>
  );
}
