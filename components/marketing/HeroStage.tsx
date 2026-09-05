"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useRef, type MouseEvent } from "react";
import { InvoicePaper } from "@/components/invoice/InvoicePaper";
import type { Invoice, Profile } from "@/lib/types";

const client = {
  id: "x",
  name: "Tomiwa Adeyemi",
  company: "Lumen Retail",
  email: "tomiwa@lumen.ng",
  phone: "",
  address: "Lagos",
  notes: "",
  createdAt: "",
};

export function HeroStage({
  invoice,
  profile,
}: {
  invoice: Invoice;
  profile: Profile;
}) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });
  const rotateX = useTransform(sy, [-40, 40], [7, -7]);
  const rotateY = useTransform(sx, [-40, 40], [-8, 8]);

  function onMove(e: MouseEvent) {
    if (reduce || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 80);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 80);
  }

  return (
    <div
      ref={wrap}
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative mx-auto w-full max-w-[520px]"
      style={{ perspective: 1200 }}
    >
      <div className="glow-orb -left-10 top-10 h-48 w-48 bg-gold/25" />
      <div className="glow-orb right-0 top-32 h-40 w-40 bg-[#8a3b22]/35" />

      <motion.div
        className="absolute -right-2 top-8 hidden w-[78%] rounded-xl border border-line bg-[#f5f0e7] p-5 text-[#161411] shadow-2xl md:block"
        initial={reduce ? false : { opacity: 0, y: 30, rotate: 8 }}
        animate={{ opacity: 1, y: 0, rotate: 6 }}
        transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a3b22]">
          Project agreement
        </p>
        <p className="mt-2 font-serif text-2xl leading-tight">
          Lumen autumn lookbook
        </p>
        <p className="mt-3 text-xs leading-5 text-[#7a7468]">
          Scope, payment, IP, and kill fee — attached to the invoice.
        </p>
      </motion.div>

      <motion.div
        className="relative z-10"
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={reduce ? false : { opacity: 0, y: 40, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-bg2 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#c45c4a]/80" />
            <span className="h-2 w-2 rounded-full bg-gold/80" />
            <span className="h-2 w-2 rounded-full bg-sage/80" />
            <span className="ml-2 text-[11px] uppercase tracking-[0.16em] text-muted">
              Studio · live preview
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-gold/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-gold2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
              Sent
            </span>
          </div>
          <div className="max-h-[420px] overflow-hidden p-3 md:max-h-[460px]">
            <InvoicePaper
              invoice={invoice}
              profile={profile}
              client={client}
              compact
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
