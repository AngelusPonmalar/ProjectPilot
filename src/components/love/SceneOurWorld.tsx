import { motion } from "motion/react";
import { CuteHeartChar } from "./Heart";
import { RevealLines, Scene } from "./Typewriter";

export function SceneOurWorld() {
  return (
    <Scene id="our-world">
      <h2 className="font-script text-5xl text-glow sm:text-6xl">Our Little World 🌈</h2>

      <div className="glass relative mt-10 w-full max-w-3xl overflow-hidden rounded-[2rem] px-4 py-14">
        <motion.svg
          viewBox="0 0 100 100"
          width={80}
          className="absolute top-6 right-8"
          animate={{ rotate: [0, 8, 0], y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="50" cy="50" r="26" fill="oklch(0.95 0.06 95)" opacity="0.9" />
          <circle cx="38" cy="44" r="20" fill="var(--card)" />
        </motion.svg>

        {[...Array(14)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-star"
            style={{
              left: `${(i * 37) % 95}%`,
              top: `${(i * 53) % 70}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              animation: `twinkle ${2 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}

        <div className="relative mt-16 flex items-end justify-between px-2 sm:px-10">
          <motion.div
            initial={{ x: -20 }}
            whileInView={{ x: 70 }}
            viewport={{ once: true }}
            transition={{ duration: 3.4, ease: "easeInOut" }}
          >
            <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
              <CuteHeartChar size={82} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ x: 20 }}
            whileInView={{ x: -70 }}
            viewport={{ once: true }}
            transition={{ duration: 3.4, ease: "easeInOut" }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            >
              <CuteHeartChar size={82} flip />
            </motion.div>
          </motion.div>
        </div>

        <svg viewBox="0 0 600 40" className="mt-2 w-full">
          <path
            d="M10 30 Q 150 4 300 30 T 590 30"
            stroke="var(--blush)"
            strokeWidth="3"
            strokeDasharray="8 10"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>

      <RevealLines
        className="mt-10 space-y-3 text-xl sm:text-2xl"
        lines={["Maybe we're both a little crazy.", "Maybe we both mess up.", "Maybe we're not perfect."]}
        gap={0.9}
      />
      <RevealLines
        className="mt-6 font-script text-6xl text-glow sm:text-7xl"
        lines={["But we're US. ❤️"]}
        delay={3}
      />
    </Scene>
  );
}
