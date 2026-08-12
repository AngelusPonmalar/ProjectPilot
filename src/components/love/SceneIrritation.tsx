import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { CuteHeartChar } from "./Heart";
import { RevealLines, Scene } from "./Typewriter";

export function SceneIrritation() {
  const [crossed, setCrossed] = useState(false);

  return (
    <Scene id="not-an-irritation">
      <motion.h2
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 180, damping: 10 }}
        className="text-6xl font-black tracking-tight text-glow sm:text-8xl"
      >
        WAIT.
      </motion.h2>

      <RevealLines
        className="mt-5 text-lg text-blush sm:text-2xl"
        lines={["There's one thing I really need you to understand."]}
        delay={0.5}
      />

      <div className="relative mt-14 flex min-h-[150px] items-center justify-center">
        <AnimatePresence mode="wait">
          {!crossed ? (
            <motion.button
              key="word"
              onClick={() => setCrossed(true)}
              exit={{ opacity: 0, scale: 0.4, filter: "blur(12px)" }}
              className="relative cursor-pointer"
            >
              <span className="animate-shake-hard block text-4xl font-black tracking-widest text-destructive sm:text-7xl">
                IRRITATION
              </span>
              <span className="mt-4 block text-sm text-muted-foreground">(tap it. go on.)</span>
            </motion.button>
          ) : (
            <motion.div
              key="nope"
              initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 11 }}
              className="relative"
            >
              <span className="font-script text-7xl text-glow sm:text-9xl">NOPE. ❤️</span>
              <motion.svg
                viewBox="0 0 100 92"
                width={70}
                className="absolute -top-8 -right-8"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.6 }}
              >
                <path
                  d="M50 88 C 12 60, 0 38, 0 25 A 25 25 0 0 1 50 14 A 25 25 0 0 1 100 25 C 100 38, 88 60, 50 88 Z"
                  fill="var(--rose)"
                />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {crossed && (
        <>
          <RevealLines
            className="mt-10 space-y-4 text-xl leading-relaxed sm:text-2xl"
            lines={[
              "I'm not an irritation.",
              "I'm just a girl who loves you.",
              "A girl who sometimes gets things wrong.",
              "A girl who can be annoying sometimes…",
            ]}
            gap={0.9}
          />
          <RevealLines
            className="mt-6 font-script text-4xl text-blush sm:text-5xl"
            lines={["…okay, maybe VERY annoying sometimes 😭"]}
            delay={4.2}
          />
          <RevealLines
            className="mt-6 text-2xl font-black text-glow sm:text-4xl"
            lines={["BUT NEVER BECAUSE I DON'T LOVE YOU. ❤️"]}
            delay={5.4}
          />
          <motion.div
            className="mt-10"
            animate={{ y: [0, -22, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <CuteHeartChar size={110} />
          </motion.div>
        </>
      )}
    </Scene>
  );
}
