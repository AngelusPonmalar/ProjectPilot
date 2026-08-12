import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Heart } from "./Heart";
import { RevealLines, Scene } from "./Typewriter";

export function SceneSorry() {
  const [open, setOpen] = useState(false);

  return (
    <Scene id="sorry">
      <h2 className="font-script text-5xl text-glow sm:text-6xl">A letter for you 💌</h2>

      <div className="relative mt-12 h-[190px] w-[290px] sm:h-[220px] sm:w-[340px]">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.8 }}
              animate={{ y: -150, opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="glass absolute inset-x-4 top-0 rounded-2xl p-5"
            >
              <p className="font-script text-3xl text-blush">for the boy I love ❤️</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen(true)}
          aria-label="Open the letter"
          className="absolute inset-0 cursor-pointer"
          animate={open ? { rotate: 0 } : { rotate: [-2, 2, -2] }}
          transition={{ duration: 0.6, repeat: open ? 0 : Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg viewBox="0 0 340 220" className="h-full w-full drop-shadow-[0_0_30px_oklch(0.7_0.2_5_/_0.5)]">
            <rect x="10" y="40" width="320" height="170" rx="18" fill="var(--blush)" />
            <motion.path
              d="M10 58 L170 150 L330 58 L330 40 L10 40 Z"
              fill="var(--rose)"
              style={{ originY: 0.2 }}
              animate={{ rotateX: open ? 180 : 0 }}
              transition={{ duration: 0.7 }}
            />
            <path d="M10 210 L150 130 L10 130 Z" fill="oklch(0.78 0.14 350)" opacity="0.6" />
            <path d="M330 210 L190 130 L330 130 Z" fill="oklch(0.78 0.14 350)" opacity="0.6" />
          </svg>
          {!open && (
            <span className="absolute inset-x-0 -bottom-8 text-sm text-muted-foreground">
              tap the envelope 🥺
            </span>
          )}
        </motion.button>
      </div>

      {open && (
        <div className="glass mt-16 w-full max-w-xl rounded-3xl p-7 sm:p-10">
          <h3 className="font-script text-5xl text-glow">I'm Sorry.</h3>
          <RevealLines
            className="mt-6 space-y-4 text-lg leading-relaxed sm:text-xl"
            lines={[
              "I'm really sorry for hurting you.",
              "I never wanted to be the reason you felt bad.",
              "I know I make mistakes.",
              "Sometimes I say or do things that hurt you without realizing how much they affect you.",
              "But please don't ever think that I don't care.",
            ]}
            gap={0.85}
          />
          <motion.div
            className="mt-8 flex items-center justify-center gap-3"
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 4.4, type: "spring" }}
          >
            <div className="animate-beat">
              <Heart size={44} glow />
            </div>
            <span className="font-script text-4xl text-glow sm:text-5xl">
              Because I LOVE YOU.
            </span>
          </motion.div>
        </div>
      )}
    </Scene>
  );
}
