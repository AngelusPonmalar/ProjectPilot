import { motion } from "motion/react";
import { Heart } from "./Heart";
import { RevealLines, Scene } from "./Typewriter";

export function SceneEmotional() {
  return (
    <Scene id="quiet" className="bg-[oklch(0.1_0.04_315_/_0.75)]">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: -40, opacity: [0, 1, 0.75] }}
        viewport={{ once: true }}
        transition={{ duration: 6, ease: "easeOut" }}
        className="mb-6"
      >
        <Heart size={90} glow />
      </motion.div>

      <RevealLines
        className="max-w-2xl space-y-6 text-lg leading-relaxed text-blush sm:text-2xl"
        lines={[
          "I don't expect you to forget everything immediately.",
          "I just want you to know that I'm genuinely sorry.",
          "I don't want to be someone you have to tolerate.",
          "I want to be someone who makes you smile.",
        ]}
        gap={1.5}
      />

      <RevealLines
        className="mt-10 space-y-3 font-script text-4xl text-glow sm:text-5xl"
        lines={["I'm not perfect.", "But my love for you is real."]}
        delay={6.5}
        gap={1.4}
      />
    </Scene>
  );
}
