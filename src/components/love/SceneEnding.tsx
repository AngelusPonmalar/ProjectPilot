import { motion } from "motion/react";
import { Heart } from "./Heart";
import { RevealLines, Scene } from "./Typewriter";

export function SceneEnding({ onReplay }: { onReplay: () => void }) {
  return (
    <Scene id="ending">
      <motion.div
        animate={{ y: [0, -16, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart size={70} glow />
      </motion.div>

      <RevealLines
        className="mt-8 space-y-3 text-xl sm:text-2xl"
        lines={[
          "I'm sorry.",
          "I love you.",
          "I'm not an irritation.",
          "I'm just someone who loves you a little too much. ❤️",
        ]}
        gap={0.8}
      />

      <RevealLines
        className="mt-10 font-script text-4xl text-glow sm:text-5xl"
        lines={["— Your annoying little love 🥺❤️"]}
        delay={3.6}
      />

      <button onClick={onReplay} className="glow-btn mt-12 px-8 py-4 text-lg font-semibold">
        Replay our little story ❤️
      </button>
    </Scene>
  );
}
