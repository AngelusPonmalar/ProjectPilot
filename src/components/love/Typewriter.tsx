import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function Typewriter({
  text,
  speed = 45,
  className = "",
  startDelay = 0,
  onDone,
}: {
  text: string;
  speed?: number;
  className?: string;
  startDelay?: number;
  onDone?: () => void;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= text.length) {
          window.clearInterval(interval);
          onDone?.();
        }
      }, speed);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      if (interval) window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, text, speed, startDelay]);

  return (
    <p ref={ref} className={className}>
      {text.slice(0, shown)}
      {shown < text.length && inView ? (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-blush align-middle motion-safe:animate-pulse" />
      ) : null}
    </p>
  );
}

export function RevealLines({
  lines,
  className = "",
  itemClassName = "",
  delay = 0,
  gap = 0.7,
}: {
  lines: string[];
  className?: string;
  itemClassName?: string;
  delay?: number;
  gap?: number;
}) {
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <motion.p
          key={line + i}
          className={itemClassName}
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.8, delay: delay + i * gap, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

export function Scene({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative flex min-h-screen w-full flex-col items-center justify-center px-5 py-24 text-center ${className}`}
    >
      {children}
    </section>
  );
}
