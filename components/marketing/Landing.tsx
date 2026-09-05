"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChatPreview } from "@/components/marketing/ChatPreview";
import { HeroStage } from "@/components/marketing/HeroStage";
import { Reveal } from "@/components/marketing/Reveal";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { I } from "@/components/icons";
import { naira } from "@/lib/format";
import { AI_AGREEMENT_PRICE, PLANS, PREMIUM_TEMPLATE_FROM } from "@/lib/pricing";
import { TEMPLATES } from "@/lib/templates";
import type { Invoice, Profile } from "@/lib/types";

const demoProfile: Profile = {
  name: "Adaeze Okonkwo",
  business: "Northlight Studio",
  role: "Videographer",
  email: "ada@northlight.studio",
  phone: "+234 810 000 4400",
  address: "Victoria Island, Lagos",
  taxId: "",
  website: "",
  bankName: "GTBank",
  accountName: "Northlight Studio",
  accountNumber: "0123456789",
  defaultCurrency: "NGN",
  defaultTaxRate: 7.5,
  defaultPaymentTerms: "50% to start",
};

const demoInvoice: Invoice = {
  id: "demo",
  number: "INV-2026-0142",
  status: "sent",
  clientId: "x",
  projectName: "Lookbook film — Lumen Retail",
  issueDate: "2026-08-20",
  dueDate: "2026-08-27",
  currency: "NGN",
  items: [
    { id: "1", description: "Two-day studio shoot", quantity: 2, rate: 180000 },
    { id: "2", description: "Hero film + stills", quantity: 1, rate: 220000 },
  ],
  taxRate: 7.5,
  discount: 0,
  discountType: "percent",
  depositPercent: 50,
  notes: "Colour in Rec.709. Files via Frame.io.",
  paymentTerms: "50% to start, balance on delivery.",
  style: {
    templateId: "frame",
    accent: "#8a3b22",
    showLogo: true,
    font: "serif",
    footer: "Northlight Studio",
  },
  paidAmount: 0,
  createdAt: "",
  updatedAt: "",
};

const fields = [
  "Content creators",
  "Videographers",
  "Photographers",
  "Product designers",
  "Software engineers",
  "Backend developers",
  "Motion designers",
  "Copywriters",
  "Music producers",
  "Illustrators",
];

const features = [
  {
    icon: I.spark,
    title: "From a brief",
    copy: "Paste the project document. We ask for price, client, deadline, and payment. The invoice generates first. Tick Include agreement if you also need a contract.",
  },
  {
    icon: I.chat,
    title: "Chat the paper",
    copy: "Invoice on the right. You on the left. Add this, include that, remove usage, change the fee — the document updates live.",
  },
  {
    icon: I.invoice,
    title: "Custom invoices",
    copy: "Line items, tax, deposits, discounts, logos, accents, and layouts. Invoice a person, a brand, or a company — in Naira or foreign currency.",
  },
  {
    icon: I.stamp,
    title: "AI agreements",
    copy: "Written for your field after the invoice exists. Scope, payment, IP, kill fee. Edit every clause, or keep chatting it.",
  },
  {
    icon: I.layout,
    title: "Premium paper",
    copy: `Editorial, studio, and ledger templates from ${naira(PREMIUM_TEMPLATE_FROM)}. Yours forever after a one-time purchase.`,
  },
  {
    icon: I.send,
    title: "Shareable links",
    copy: "Send a private page. Your client opens a paper invoice, reads the agreement, and can mark it signed — no PDF scavenger hunt.",
  },
];

export function Landing() {
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="glow-orb left-[12%] top-[-4rem] h-72 w-72 bg-gold/15" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
            <div>
              <motion.p
                className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gold"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {I.spark({ size: 12 })} For every creative field
              </motion.p>
              <motion.h1
                className="font-serif mt-5 text-5xl leading-[1.05] md:text-7xl"
                initial={reduce ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                Send an invoice that{" "}
                <em className="text-gold2">looks like the work.</em>
              </motion.h1>
              <motion.p
                className="mt-6 max-w-md text-lg text-muted"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.16 }}
              >
                Paste a project brief. AgreeMind asks for the fee and what the
                paper still needs, then writes the invoice. Tick Include
                agreement if you want a contract after. Chat the result until it
                reads like the job.
              </motion.p>
              <motion.div
                className="mt-8 flex flex-wrap gap-3"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.24 }}
              >
                <Link href="/signup" className="btn btn-gold">
                  Start free {I.arrow({ size: 16 })}
                </Link>
                <Link href="/pricing" className="btn btn-ghost">
                  See pricing
                </Link>
              </motion.div>
              <motion.p
                className="mt-5 text-sm text-muted"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                AI agreements {naira(AI_AGREEMENT_PRICE)} · Premium templates from{" "}
                {naira(PREMIUM_TEMPLATE_FROM)}
              </motion.p>
            </div>
            <HeroStage invoice={demoInvoice} profile={demoProfile} />
          </div>
        </section>

        <Reveal>
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {[
              { k: "Free invoices", v: "Unlimited drafts" },
              { k: "AI agreement", v: naira(AI_AGREEMENT_PRICE) },
              { k: "Premium paper", v: `From ${naira(PREMIUM_TEMPLATE_FROM)}` },
            ].map((s) => (
              <div key={s.k} className="bg-bg2 px-6 py-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{s.k}</p>
                <p className="font-serif mt-1 text-2xl">{s.v}</p>
              </div>
            ))}
            </div>
          </div>
        </Reveal>

        <div className="marquee-wrap mt-12 overflow-hidden border-y border-line py-3">
          <div className="marquee-track flex gap-10 whitespace-nowrap text-[12px] uppercase tracking-[0.2em] text-muted">
            {[...fields, ...fields].map((f, i) => (
              <span key={i} className="inline-flex items-center gap-10">
                <span className="text-gold">✦</span>
                {f}
              </span>
            ))}
          </div>
        </div>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
              What you get
            </p>
            <h2 className="font-serif mt-3 max-w-2xl text-4xl md:text-5xl">
              Everything an invoicing studio needs. Nothing a ledger demands.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="lift-card h-full rounded-2xl border border-line bg-bg2 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold">
                    {f.icon()}
                  </div>
                  <h3 className="font-serif mt-4 text-2xl">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{f.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="relative border-y border-line bg-bg2">
          <div className="glow-orb right-[8%] top-10 h-56 w-56 bg-gold/10" />
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
                Prompt to paper
              </p>
              <h2 className="font-serif mt-3 text-4xl md:text-5xl">
                Paste the job. Chat until it is right.
              </h2>
              <p className="mt-4 text-muted">
                Drop an email, a scope of work, or notes. AgreeMind pulls the
                client, deliverables, and dates, then asks for the fee and
                anything still missing. The invoice always comes first. Tick
                Include agreement only when you want a contract on the same
                brief.
              </p>
              <ol className="mt-8 space-y-4 text-sm">
                {[
                  "Paste the project document.",
                  "Confirm price, payment, deadline — tick Include agreement if you need one.",
                  "Chat on the left. The invoice (and agreement) sit on the right.",
                ].map((s, i) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 font-mono text-[11px] text-gold">
                      0{i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <Link href="/signup" className="btn btn-gold mt-8">
                Try from a brief
              </Link>
            </Reveal>
            <Reveal delay={0.12}>
              <ChatPreview />
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
                  Pricing
                </p>
                <h2 className="font-serif mt-3 text-4xl">
                  Pay for paper and language. Not a seat.
                </h2>
              </div>
              <Link href="/pricing" className="hidden text-sm text-gold md:inline">
                Full pricing →
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PLANS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <div
                  className={`lift-card flex h-full flex-col rounded-2xl border p-6 ${
                    p.featured ? "border-gold bg-bg2 md:-translate-y-2" : "border-line"
                  }`}
                >
                  {p.featured && (
                    <span className="mb-3 w-fit rounded-full border border-gold/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-gold">
                      Most used
                    </span>
                  )}
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    {p.name}
                  </p>
                  <p className="font-serif mt-2 text-4xl">{p.price}</p>
                  <p className="text-xs text-muted">{p.cadence}</p>
                  <p className="mt-3 text-sm text-muted">{p.blurb}</p>
                  <Link
                    href={p.href}
                    className={`btn mt-6 w-full ${p.featured ? "btn-gold" : "btn-ghost"}`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <Reveal>
            <h2 className="font-serif text-4xl">Layouts for the kind of work you do.</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.filter((t) => t.kind === "invoice").map((t, i) => (
              <Reveal key={t.id} delay={i * 0.05}>
                <Link
                  href="/templates"
                  className="lift-card block overflow-hidden rounded-2xl border border-line"
                >
                  <div className="h-28" style={{ background: t.paper }}>
                    <div className="h-1.5 w-full" style={{ background: t.accent }} />
                    <p
                      className="px-4 pt-6 font-serif text-2xl"
                      style={{ color: t.ink }}
                    >
                      {t.name}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted">{t.field}</p>
                    <p className="mt-1 text-sm">
                      {t.premium ? naira(t.price) : "Free"}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="px-5 pb-24">
          <Reveal>
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-gold/30 bg-bg2 px-8 py-14 text-center md:px-16">
              <div className="glow-orb left-1/2 top-0 h-48 w-48 -translate-x-1/2 bg-gold/20" />
              <p className="relative text-[11px] uppercase tracking-[0.22em] text-gold">
                Open a studio
              </p>
              <h2 className="font-serif relative mt-3 text-4xl md:text-5xl">
                Paste the brief tonight. Get paid looking like the work.
              </h2>
              <p className="relative mx-auto mt-4 max-w-lg text-muted">
                Free invoices. Chat the paper. Attach an agreement when the job
                needs one.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/signup" className="btn btn-gold">
                  Start free {I.arrow({ size: 16 })}
                </Link>
                <Link href="/studio/prompt" className="btn btn-ghost">
                  See from a brief
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
