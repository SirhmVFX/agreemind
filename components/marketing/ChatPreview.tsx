"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const beats = [
  {
    role: "you" as const,
    text: "Add colour grade at 80,000. Remove usage. Also include captions.",
  },
  {
    role: "studio" as const,
    text: "Added colour grade. Removed usage. Captions are on the invoice — the paper on the right already moved.",
  },
  {
    role: "you" as const,
    text: "Make the deposit 50% and due in 7 days.",
  },
  {
    role: "studio" as const,
    text: "Deposit is 50%. Due date is a week from issue. Ready to share.",
  },
];

export function ChatPreview() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? beats.length : 1);

  useEffect(() => {
    if (reduce) return;
    if (count >= beats.length) {
      const reset = setTimeout(() => setCount(1), 4200);
      return () => clearTimeout(reset);
    }
    const t = setTimeout(() => setCount((c) => c + 1), 1600);
    return () => clearTimeout(t);
  }, [count, reduce]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-bg p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
          Chat the paper
        </p>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
          Live
        </span>
      </div>
      <div className="min-h-[220px] space-y-3">
        <AnimatePresence initial={false}>
          {beats.slice(0, count).map((b, i) => (
            <motion.div
              key={`${b.role}-${i}`}
              initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                b.role === "you"
                  ? "ml-auto bg-gold text-ink"
                  : "bg-bg2 text-fg"
              }`}
            >
              <p className="mb-1 text-[10px] uppercase tracking-[0.16em] opacity-70">
                {b.role === "you" ? "You" : "AgreeMind"}
              </p>
              {b.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
