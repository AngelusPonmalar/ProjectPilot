import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Heart } from "./Heart";
import { Typewriter, Scene } from "./Typewriter";
import { HeartBurst } from "./HeartBurst";

export function SceneHero({ onOpen, opened }: { onOpen: () => void; opened: boolean }) {
  const [bursting, setBursting] = useState(false);

  const open = () => {
    if (opened) return;
    setBursting(true);
    window.setTimeout(onOpen, 900);
  };

  return (
    <Scene id="hero">
      <motion.div
        className="pointer-events-none absolute top-14 right-8 opacity-80 sm:right-20"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 100" width={90} height={90}>
          <defs>
            <radialGradient id="moonG">
              <stop offset="0%" stopColor="oklch(0.98 0.05 95)" />
              <stop offset="100%" stopColor="oklch(0.85 0.09 80 / 0.35)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="30" fill="url(#moonG)" />
          <circle cx="42" cy="42" r="5" fill="oklch(0.9 0.05 90 / 0.5)" />
          <circle cx="58" cy="58" r="7" fill="oklch(0.9 0.05 90 / 0.4)" />
        </svg>
      </motion.div>

      <motion.div
        className="relative mb-8"
        animate={{ y: [0, -18, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="animate-beat">
          <Heart size={110} glow />
        </div>
        <AnimatePresence>{bursting && <HeartBurst count={70} spread={420} />}</AnimatePresence>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="font-script text-6xl text-glow sm:text-8xl"
      >
        Hey you… 👀❤️
      </motion.h1>

      <Typewriter
        text="Don't run away."
        startDelay={1200}
        className="mt-6 text-xl text-blush sm:text-2xl"
      />
      <Typewriter
        text="I made something for you… 🥺"
        startDelay={2600}
        className="mt-2 text-lg text-muted-foreground sm:text-xl"
      />

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 4, type: "spring", stiffness: 200, damping: 12 }}
        onClick={open}
        className="glow-btn mt-12 px-9 py-4 text-lg font-semibold"
      >
        Open My Heart ❤️
      </motion.button>

      <AnimatePresence>
        {opened && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-10 text-sm text-muted-foreground"
          >
            keep scrolling ↓
          </motion.p>
        )}
      </AnimatePresence>
    </Scene>
  );
}
