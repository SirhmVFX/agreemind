import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { naira } from "@/lib/format";
import { AI_AGREEMENT_PRICE, PLANS, PREMIUM_TEMPLATE_FROM, STUDIO_PACK_PRICE } from "@/lib/pricing";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Pricing</p>
        <h1 className="font-serif mt-3 max-w-3xl text-5xl md:text-6xl">
          Free invoices. Pay when you need better paper or a contract.
        </h1>
        <p className="mt-5 max-w-xl text-muted">
          No monthly seat tax. Paste a brief for a free invoice. Creators pay
          for an AI agreement at {naira(AI_AGREEMENT_PRICE)}, or a premium
          layout from {naira(PREMIUM_TEMPLATE_FROM)}.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border p-7 ${p.featured ? "border-gold bg-bg2" : "border-line"}`}
            >
              {p.featured && (
                <span className="mb-3 w-fit text-[10px] uppercase tracking-[0.18em] text-gold">
                  Most used
                </span>
              )}
              <h2 className="font-serif text-3xl">{p.name}</h2>
              <p className="mt-2 font-serif text-4xl">{p.price}</p>
              <p className="text-xs text-muted">{p.cadence}</p>
              <p className="mt-3 text-sm text-muted">{p.blurb}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
              <Link href={p.href} className={`btn mt-8 ${p.featured ? "btn-gold" : "btn-ghost"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-line p-7 md:flex md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Studio pack</p>
            <h2 className="font-serif mt-2 text-3xl">{naira(STUDIO_PACK_PRICE)}</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              All premium invoice and agreement templates, plus five AI agreement
              credits. For studios sending work every week.
            </p>
          </div>
          <Link href="/signup" className="btn btn-gold mt-6 md:mt-0">
            Get the pack
          </Link>
        </div>

        <section className="mt-20">
          <h2 className="font-serif text-3xl">From a brief, then chat</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Paste the project. We ask for price and the rest. Invoice first.
            Tick Include agreement only if you want a contract. Then chat:
            add this, include that, remove the other — paper on the right.
          </p>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl">From a brief, then chat</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Paste the project. We ask for price and the rest. Invoice first.
            Tick Include agreement only if you want a contract. Then chat:
            add this, include that, remove the other — paper on the right.
          </p>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl">What is included in free</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Unlimited invoices, any currency",
              "Paste a project document and generate an invoice",
              "Chat to add, include, or remove lines",
              "Clients, projects, notes, tax, deposits, discounts",
              "Three layouts: Atelier, Frame, Commit",
              "Public invoice links, download, and print",
            ].map((x) => (
              <p key={x} className="border-t border-line pt-4 text-muted">
                {x}
              </p>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
