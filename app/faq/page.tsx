import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";

export const metadata = { title: "FAQ" };

const faqs = [
  {
    q: "Who is AgreeMind for?",
    a: "Anyone who invoices for creative or technical work: content creators, videographers, photographers, product designers, software engineers, backend developers, motion designers, copywriters, and studios that mix those roles.",
  },
  {
    q: "Can I create an invoice from a project document?",
    a: "Yes. Paste the brief, SOW, or email. AgreeMind reads what it can, then asks for the fee and anything still missing — client, deadline, payment. It always generates the invoice first. Tick Include agreement if you also want a contract from the same brief.",
  },
  {
    q: "What is chat the paper?",
    a: "After generation, you sit in a studio with the invoice (and agreement, if you ticked it) on the right. Type add this, include that, remove usage, change the fee, tax, deposit, or due date. The document updates live. You can still open the full editor.",
  },
  {
    q: "Can I customize the invoice?",
    a: "Yes. Change layout, accent colour, type (serif or sans), logo, notes, footer, tax, discount, deposit, currency, payment terms, and line items. Premium templates add editorial and dark-studio looks, from ₦999.",
  },
  {
    q: "How does the AI agreement work?",
    a: "From a brief, tick Include agreement after the invoice questions. Or use the agreement wizard. AgreeMind writes scope, payment, IP, and kill-fee language for your field. You can edit every clause or keep chatting it. Each generation costs ₦1,299, or uses a credit.",
  },
  {
    q: "Is the agreement legal advice?",
    a: "No. It is a working studio contract generated from your answers. Have counsel review it for high-stakes deals. You remain responsible for the terms you send.",
  },
  {
    q: "What currencies can I invoice in?",
    a: "NGN, USD, GBP, EUR, and CAD. Bank details live on your studio profile so every invoice can show how to pay.",
  },
  {
    q: "Do clients need an account?",
    a: "No. They open a private link, read the paper invoice, download a PDF, and can sign the attached agreement in the browser.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">FAQ</p>
        <h1 className="font-serif mt-3 text-5xl">Questions, answered plainly.</h1>
        <div className="mt-12 divide-y divide-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-6">
              <h2 className="font-serif text-2xl">{f.q}</h2>
              <p className="mt-2 text-muted leading-7">{f.a}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
