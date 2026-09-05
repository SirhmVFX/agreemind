export const AI_AGREEMENT_PRICE = 1299;
export const PREMIUM_TEMPLATE_FROM = 999;
export const STUDIO_PACK_PRICE = 12500;

export const PLANS = [
  {
    id: "free",
    name: "Studio free",
    price: "₦0",
    cadence: "forever",
    blurb: "For creatives who need to send a clean invoice today.",
    cta: "Start invoicing",
    href: "/signup",
    featured: false,
    features: [
      "Unlimited invoices",
      "Paste a brief — get an invoice",
      "Chat to revise the paper",
      "Client directory",
      "3 free invoice layouts",
      "Shareable client links",
      "Payment tracking",
      "Print-ready paper invoices",
    ],
  },
  {
    id: "templates",
    name: "Premium templates",
    price: "From ₦999",
    cadence: "one-time",
    blurb: "Editorial layouts designed for studios, not spreadsheets.",
    cta: "Browse templates",
    href: "/templates",
    featured: false,
    features: [
      "Studio, editorial, and ledger layouts",
      "Matching agreement covers",
      "Yours forever after purchase",
      "Logo, accent, and type controls",
      "Works on every invoice you send",
    ],
  },
  {
    id: "ai",
    name: "AI agreement",
    price: "₦1,299",
    cadence: "per contract",
    blurb: "Invoice first from a pasted brief. Tick Include agreement for a contract you can chat.",
    cta: "Generate an agreement",
    href: "/signup",
    featured: true,
    features: [
      "Written for your creative field",
      "Tick Include agreement after the invoice",
      "Scope, deliverables, and deadlines",
      "Payment, kill fee, and IP terms",
      "Chat to add or remove clauses",
      "Client can review and sign",
    ],
  },
] as const;
