"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AgreementPaper } from "@/components/agreement/AgreementPaper";
import { InvoicePaper } from "@/components/invoice/InvoicePaper";
import { I } from "@/components/icons";
import { applyChatEdit } from "@/lib/prompt-engine";
import { useStore } from "@/lib/store";
import type { Agreement, Invoice } from "@/lib/types";

type ChatMsg = { role: "user" | "studio"; text: string };

export default function PromptChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    invoiceById,
    agreementById,
    clientById,
    saveInvoice,
    saveAgreement,
    state,
  } = useStore();
  const stored = invoiceById(id);
  const [invoice, setInvoice] = useState<Invoice | null>(stored || null);
  const storedAg = invoice?.agreementId
    ? agreementById(invoice.agreementId)
    : undefined;
  const [agreement, setAgreement] = useState<Agreement | undefined>(storedAg);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"invoice" | "agreement">("invoice");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "studio",
      text: storedAg
        ? "Invoice is on the right. The agreement is attached. Tell me what to add, include, or remove."
        : "Invoice is on the right. Say things like: add colour grade at 80000, remove usage, tax 7.5, due in 10 days.",
    },
  ]);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stored) setInvoice(stored);
  }, [stored]);
  useEffect(() => {
    if (storedAg) setAgreement(storedAg);
  }, [storedAg]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const client = invoice
    ? clientById(invoice.clientId) || invoice.clientSnapshot
    : undefined;

  function send(text: string) {
    if (!invoice || !text.trim()) return;
    const result = applyChatEdit(text, invoice, agreement);
    setInvoice(result.invoice);
    saveInvoice(result.invoice);
    if (result.agreement) {
      setAgreement(result.agreement);
      saveAgreement(result.agreement);
    }
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "studio", text: result.reply },
    ]);
    setInput("");
  }

  if (!invoice) {
    return (
      <p className="text-muted">
        Invoice not found. <Link href="/studio/prompt">Start a brief</Link>
      </p>
    );
  }

  return (
    <div className="xl:-mx-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/studio/prompt"
            className="text-xs uppercase tracking-[0.16em] text-muted"
          >
            ← From a brief
          </Link>
          <h1 className="font-serif mt-1 text-3xl">{invoice.number}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/studio/invoices/${invoice.id}`} className="btn btn-ghost">
            Edit fields
          </Link>
          <Link href={`/i/${invoice.id}`} className="btn btn-gold" target="_blank">
            Open client link
          </Link>
        </div>
      </div>

      <div className="grid min-h-[70vh] gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <div className="flex min-h-[28rem] flex-col rounded-2xl border border-line bg-bg2">
          <div className="border-b border-line px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted">
            Chat the paper
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  m.role === "user"
                    ? "ml-auto bg-gold text-ink"
                    : "bg-bg text-fg"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={bottom} />
          </div>
          <form
            className="flex gap-2 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              className="field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add this, include that, remove usage…"
            />
            <button className="btn btn-gold !px-4" type="submit">
              {I.send({ size: 16 })}
            </button>
          </form>
          <div className="flex flex-wrap gap-2 px-3 pb-3">
            {[
              "add colour grade at 80000",
              "tax 7.5",
              "deposit 50",
              "due in 7 days",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-fg"
                onClick={() => send(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div>
          {agreement && (
            <div className="mb-3 flex gap-2">
              {(["invoice", "agreement"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-gold text-ink" : "border border-line text-muted"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          {tab === "agreement" && agreement ? (
            <AgreementPaper
              agreement={agreement}
              client={client}
              profile={state.profile}
            />
          ) : (
            <InvoicePaper
              invoice={invoice}
              client={client}
              profile={state.profile}
              agreement={agreement}
              compact
            />
          )}
        </div>
      </div>
    </div>
  );
}
