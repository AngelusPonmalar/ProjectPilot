import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Starfield, FloatingHearts, Clouds } from "@/components/love/Ambient";
import { CursorHearts } from "@/components/love/CursorHearts";
import { SceneHero } from "@/components/love/SceneHero";
import { SceneSorry } from "@/components/love/SceneSorry";
import { SceneIrritation } from "@/components/love/SceneIrritation";
import { SceneInteractiveHeart } from "@/components/love/SceneInteractiveHeart";
import { SceneLoveCalculator } from "@/components/love/SceneLoveCalculator";
import { SceneEmotional } from "@/components/love/SceneEmotional";
import { SceneOurWorld } from "@/components/love/SceneOurWorld";
import { SceneFinalQuestion } from "@/components/love/SceneFinalQuestion";
import { SceneEnding } from "@/components/love/SceneEnding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "I'm Sorry — A Little Love Letter For You ❤️" },
      {
        name: "description",
        content:
          "An animated apology letter full of hearts, stars and sparkles — from a girl who loves you a little too much.",
      },
      { property: "og:title", content: "I'm Sorry — A Little Love Letter For You ❤️" },
      {
        property: "og:description",
        content: "Open my heart: an animated, emotional, slightly crazy apology made just for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoveLetter,
});

function LoveLetter() {
  const [opened, setOpened] = useState(false);
  const [key, setKey] = useState(0);

  const replay = () => {
    setOpened(false);
    setKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main key={key} className="relative">
      <Starfield />
      <Clouds />
      <FloatingHearts />
      <CursorHearts />

      <h1 className="sr-only">I'm sorry — an animated love letter for you</h1>

      <SceneHero opened={opened} onOpen={() => setOpened(true)} />

      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <SceneSorry />
            <SceneIrritation />
            <SceneInteractiveHeart />
            <SceneLoveCalculator />
            <SceneEmotional />
            <SceneOurWorld />
            <SceneFinalQuestion />
            <SceneEnding onReplay={replay} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
