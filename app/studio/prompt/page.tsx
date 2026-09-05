"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PayModal } from "@/components/ui/PayModal";
import { I } from "@/components/icons";
import { CREATIVE_FIELDS, nextInvoiceNumber, todayISO, uid } from "@/lib/format";
import { AI_AGREEMENT_PRICE } from "@/lib/pricing";
import {
  buildAgreementFromPrompt,
  buildInvoiceFromPrompt,
  defaultAnswers,
  extractFromDocument,
  type PromptAnswers,
} from "@/lib/prompt-engine";
import { useStore } from "@/lib/store";
import type { Client, Currency } from "@/lib/types";

export default function PromptPage() {
  const { state, saveClient, saveInvoice, saveAgreement, spendAiCredit } =
    useStore();
  const router = useRouter();
  const [step, setStep] = useState<"paste" | "ask">("paste");
  const [documentText, setDocumentText] = useState("");
  const [answers, setAnswers] = useState<PromptAnswers>(
    defaultAnswers(
      extractFromDocument("", state.profile.defaultCurrency),
      state.profile,
    ),
  );
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const missing = useMemo(() => {
    const gaps: string[] = [];
    if (!answers.clientName) gaps.push("client");
    if (!answers.totalFee && !answers.lineHints.length) gaps.push("price");
    if (!answers.projectName) gaps.push("project");
    if (!answers.deadline) gaps.push("deadline");
    return gaps;
  }, [answers]);

  function patch(p: Partial<PromptAnswers>) {
    setAnswers((a) => ({ ...a, ...p }));
  }

  function parseDoc() {
    const extracted = extractFromDocument(
      documentText,
      state.profile.defaultCurrency,
    );
    setAnswers(defaultAnswers(extracted, state.profile));
    setStep("ask");
  }

  function resolveClient(): Client {
    const match = state.clients.find(
      (c) =>
        c.name.toLowerCase() === answers.clientName.toLowerCase() ||
        (answers.email && c.email.toLowerCase() === answers.email.toLowerCase()),
    );
    if (match) return match;
    const client: Client = {
      id: uid("cl"),
      name: answers.clientName || "Client",
      company: answers.company,
      email: answers.email,
      phone: "",
      address: "",
      notes: "Created from a pasted brief",
      createdAt: todayISO(),
    };
    saveClient(client);
    return client;
  }

  function generate() {
    setBusy(true);
    const client = resolveClient();
    const invoice = buildInvoiceFromPrompt({
      answers,
      client,
      profile: state.profile,
      number: nextInvoiceNumber(state.invoices),
      ownerId: undefined,
    });
    saveInvoice(invoice);

    if (answers.includeAgreement) {
      const agreement = buildAgreementFromPrompt({
        answers,
        client,
        profile: state.profile,
        invoiceId: invoice.id,
      });
      saveAgreement(agreement);
      saveInvoice({ ...invoice, agreementId: agreement.id });
    }

    setBusy(false);
    router.push(`/studio/prompt/${invoice.id}`);
  }

  function tryGenerate() {
    if (missing.includes("price") || missing.includes("client")) return;
    if (answers.includeAgreement && state.aiCredits < 1) {
      setPayOpen(true);
      return;
    }
    if (answers.includeAgreement) spendAiCredit();
    generate();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
        From a brief
      </p>
      <h1 className="font-serif mt-2 text-4xl md:text-5xl">
        {step === "paste" ? "Paste the project." : "Fill what’s missing."}
      </h1>
      <p className="mt-2 text-muted">
        {step === "paste"
          ? "Drop an email, SOW, or brief. AgreeMind reads it, then asks for price and anything the paper still needs. The invoice comes first."
          : "Confirm the fee. Tick Include agreement only if you want a contract after the invoice."}
      </p>

      {step === "paste" ? (
        <div className="mt-8 space-y-4">
          <label>
            <span className="label">Project document</span>
            <textarea
              className="field min-h-64 font-mono text-sm"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder={`Client: Lumen Retail
Project: Autumn lookbook film
Deliverables: 45s hero, 9 stills
Deadline: 10 Sep 2026
Fee: 480,000 NGN
Payment: 50% to start`}
            />
          </label>
          <button
            className="btn btn-gold"
            disabled={documentText.trim().length < 8}
            onClick={parseDoc}
          >
            Continue {I.arrow({ size: 16 })}
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <label>
            <span className="label">Client name</span>
            <input
              className="field"
              value={answers.clientName}
              onChange={(e) => patch({ clientName: e.target.value })}
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Company</span>
              <input
                className="field"
                value={answers.company}
                onChange={(e) => patch({ company: e.target.value })}
              />
            </label>
            <label>
              <span className="label">Client email</span>
              <input
                className="field"
                type="email"
                value={answers.email}
                onChange={(e) => patch({ email: e.target.value })}
              />
            </label>
          </div>
          <label>
            <span className="label">Project</span>
            <input
              className="field"
              value={answers.projectName}
              onChange={(e) => patch({ projectName: e.target.value })}
            />
          </label>
          <label>
            <span className="label">Deliverables</span>
            <textarea
              className="field min-h-24"
              value={answers.deliverables}
              onChange={(e) => patch({ deliverables: e.target.value })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Total fee</span>
              <input
                className="field"
                value={answers.totalFee}
                onChange={(e) => patch({ totalFee: e.target.value })}
                placeholder="480000"
              />
            </label>
            <label>
              <span className="label">Currency</span>
              <select
                className="field"
                value={answers.currency}
                onChange={(e) =>
                  patch({ currency: e.target.value as Currency })
                }
              >
                {["NGN", "USD", "GBP", "EUR", "CAD"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Deadline</span>
              <input
                className="field"
                type="date"
                value={answers.deadline}
                onChange={(e) => patch({ deadline: e.target.value })}
              />
            </label>
            <label>
              <span className="label">Your field</span>
              <select
                className="field"
                value={answers.field}
                onChange={(e) => patch({ field: e.target.value })}
              >
                {CREATIVE_FIELDS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span className="label">Mode of payment</span>
            <input
              className="field"
              value={answers.paymentMode}
              onChange={(e) => patch({ paymentMode: e.target.value })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Tax %</span>
              <input
                className="field"
                type="number"
                value={answers.taxRate}
                onChange={(e) => patch({ taxRate: Number(e.target.value) })}
              />
            </label>
            <label>
              <span className="label">Deposit %</span>
              <input
                className="field"
                type="number"
                value={answers.depositPercent}
                onChange={(e) =>
                  patch({ depositPercent: Number(e.target.value) })
                }
              />
            </label>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-line bg-bg2 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[#c4a06a]"
              checked={answers.includeAgreement}
              onChange={(e) => patch({ includeAgreement: e.target.checked })}
            />
            <span>
              <span className="block font-medium">Include agreement</span>
              <span className="text-sm text-muted">
                Invoice generates first. If this is ticked, a contract is written
                from the same brief and attached. {AI_AGREEMENT_PRICE.toLocaleString("en-NG")}{" "}
                NGN or 1 AI credit.
              </span>
            </span>
          </label>

          {answers.includeAgreement && (
            <div className="space-y-3 rounded-2xl border border-line p-4">
              <label>
                <span className="label">Revisions</span>
                <input
                  className="field"
                  value={answers.revisions}
                  onChange={(e) => patch({ revisions: e.target.value })}
                />
              </label>
              <label>
                <span className="label">Who owns the work</span>
                <input
                  className="field"
                  value={answers.ipOwnership}
                  onChange={(e) => patch({ ipOwnership: e.target.value })}
                />
              </label>
              <label>
                <span className="label">Kill fee</span>
                <input
                  className="field"
                  value={answers.killFee}
                  onChange={(e) => patch({ killFee: e.target.value })}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={answers.confidentiality}
                  onChange={(e) =>
                    patch({ confidentiality: e.target.checked })
                  }
                />
                Confidentiality clause
              </label>
            </div>
          )}

          {missing.length > 0 && (
            <p className="text-sm text-danger">
              Still need: {missing.join(", ")}.
            </p>
          )}

          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => setStep("paste")}>
              Back
            </button>
            <button
              className="btn btn-gold"
              disabled={busy || missing.includes("price") || missing.includes("client")}
              onClick={tryGenerate}
            >
              {I.spark({ size: 16 })}{" "}
              {answers.includeAgreement
                ? "Generate invoice + agreement"
                : "Generate invoice"}
            </button>
          </div>
        </div>
      )}

      <PayModal
        open={payOpen}
        title="AI agreement"
        amount={AI_AGREEMENT_PRICE}
        copy="The invoice is free from a brief. The attached contract is billed once."
        onClose={() => setPayOpen(false)}
        onConfirm={() => {
          setPayOpen(false);
          generate();
        }}
      />
    </div>
  );
}
