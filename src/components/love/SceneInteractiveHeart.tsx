import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Heart } from "./Heart";
import { HeartBurst } from "./HeartBurst";
import { Scene } from "./Typewriter";

const MESSAGES = [
  "I'm sorry.",
  "I care about you.",
  "I don't want to lose you.",
  "You mean so much to me.",
  "I LOVE YOU.",
];

export function SceneInteractiveHeart() {
  const [clicks, setClicks] = useState(0);
  const done = clicks >= MESSAGES.length;

  return (
    <Scene id="click-my-heart">
      <h2 className="font-script text-5xl text-glow sm:text-6xl">Click my heart.</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        {done ? "you broke it (in a good way) 😭" : `${clicks} / ${MESSAGES.length}`}
      </p>

      <div className="relative mt-12 flex h-[240px] items-center justify-center">
        <motion.button
          onClick={() => setClicks((c) => Math.min(c + 1, MESSAGES.length))}
          whileTap={{ scale: 0.85 }}
          animate={{ scale: [1, 1.1 + clicks * 0.02, 1] }}
          transition={{ duration: Math.max(0.35, 1.4 - clicks * 0.2), repeat: Infinity }}
          className="cursor-pointer"
          aria-label="Click my heart"
        >
          <Heart size={200} glow />
        </motion.button>
        <AnimatePresence>{done && <HeartBurst count={160} spread={640} duration={2.6} />}</AnimatePresence>
      </div>

      <div className="mt-10 flex min-h-[160px] flex-col items-center gap-3">
        <AnimatePresence>
          {MESSAGES.slice(0, clicks).map((m, i) => (
            <motion.p
              key={m}
              initial={{ opacity: 0, y: 24, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className={
                i === MESSAGES.length - 1
                  ? "font-script text-5xl text-glow sm:text-6xl"
                  : "text-xl text-blush sm:text-2xl"
              }
            >
              {m}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </Scene>
  );
}
