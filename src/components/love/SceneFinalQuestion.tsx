import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Heart } from "./Heart";
import { HeartBurst } from "./HeartBurst";
import { RevealLines, Scene } from "./Typewriter";

export function SceneFinalQuestion() {
  const [answer, setAnswer] = useState<"yes" | "time" | null>(null);

  return (
    <Scene id="forgive">
      <motion.div
        className="animate-beat"
        animate={{ filter: ["brightness(1)", "brightness(1.25)", "brightness(1)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Heart size={170} glow />
      </motion.div>

      <RevealLines className="mt-8 font-script text-5xl text-glow" lines={["So…"]} />
      <RevealLines
        className="mt-3 text-2xl sm:text-3xl"
        lines={["Can you forgive this stupid little girl? 🥺❤️"]}
        delay={1.2}
      />

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button onClick={() => setAnswer("yes")} className="glow-btn px-8 py-4 text-lg font-semibold">
          ❤️ Yes
        </button>
        <button onClick={() => setAnswer("time")} className="ghost-btn px-8 py-4 text-lg font-semibold">
          🥺 I need time
        </button>
      </div>

      <div className="relative mt-10 min-h-[180px] w-full max-w-xl">
        <AnimatePresence mode="wait">
          {answer === "yes" && (
            <motion.div
              key="yes"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-3xl p-8"
            >
              <HeartBurst count={200} spread={800} duration={3} fixed />
              <motion.p
                animate={{ rotate: [-3, 3, -3], scale: [1, 1.06, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="font-script text-6xl text-glow"
              >
                YAYYYYY 😭❤️
              </motion.p>
              <p className="mt-4 text-2xl font-black">COME HERE YOU IDIOT.</p>
              <p className="mt-1 text-xl text-blush">I LOVE YOU SO MUCH.</p>
            </motion.div>
          )}
          {answer === "time" && (
            <motion.div
              key="time"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass rounded-3xl p-8"
            >
              <p className="font-script text-5xl text-glow">Okay. ❤️</p>
              <p className="mt-4 text-xl">Take your time.</p>
              <p className="mt-1 text-lg text-muted-foreground">
                I just wanted you to know what is in my heart.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Scene>
  );
}
