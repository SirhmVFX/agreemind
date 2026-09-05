"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PayModal } from "@/components/ui/PayModal";
import { I } from "@/components/icons";
import { generateAgreement, WIZARD_STEPS } from "@/lib/agreement-engine";
import { CREATIVE_FIELDS, todayISO, uid } from "@/lib/format";
import { AI_AGREEMENT_PRICE } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { AgreementBrief, Currency } from "@/lib/types";

const emptyBrief = (currency: Currency): AgreementBrief => ({
  field: "Videographer",
  projectType: "",
  deliverables: "",
  startDate: todayISO(),
  deadline: "",
  paymentMode: "50% deposit, balance on delivery",
  totalFee: "",
  currency,
  revisions: "two rounds of reasonable revisions",
  ipOwnership: "Client owns final deliverables after full payment",
  usageRights: "unlimited digital use for the named client brand",
  killFee: "50% of the remaining fee if cancelled after work has begun",
  confidentiality: false,
  lateFee: "5% of the outstanding balance after 7 days past due",
  jurisdiction: "the Federal Republic of Nigeria",
  extras: "",
});

export default function NewAgreementPage() {
  const { state, saveAgreement, spendAiCredit, clientById } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState(state.clients[0]?.id || "");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState<AgreementBrief>(
    emptyBrief(state.profile.defaultCurrency),
  );
  const [payOpen, setPayOpen] = useState(false);

  const meta = WIZARD_STEPS[step];

  function patch(p: Partial<AgreementBrief>) {
    setBrief((b) => ({ ...b, ...p }));
  }

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(brief.field && brief.projectType && clientId);
    if (step === 1) return Boolean(brief.deliverables && brief.deadline);
    if (step === 2) return Boolean(brief.paymentMode && brief.totalFee);
    return true;
  }, [step, brief, clientId]);

  function generate() {
    const client = clientById(clientId);
    const body = generateAgreement(brief, {
      creator: state.profile.name,
      business: state.profile.business,
      client: client?.name || "Client",
      company: client?.company,
    });
    const agreement = {
      id: uid("ag"),
      title: title || `${brief.projectType} agreement`,
      clientId,
      status: "draft" as const,
      brief,
      body,
      createdAt: new Date().toISOString(),
    };
    saveAgreement(agreement);
    router.push(`/studio/agreements/${agreement.id}`);
  }

  function tryGenerate() {
    if (state.aiCredits > 0) {
      spendAiCredit();
      generate();
      return;
    }
    setPayOpen(true);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
        AI agreement · {AI_AGREEMENT_PRICE.toLocaleString("en-NG")} NGN
      </p>
      <h1 className="font-serif mt-2 text-4xl">{meta.title}</h1>
      <p className="mt-2 text-muted">{meta.copy}</p>

      <div className="mt-6 flex gap-2">
        {WIZARD_STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-gold" : "bg-line"}`}
          />
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {step === 0 && (
          <>
            <label>
              <span className="label">Client</span>
              <select
                className="field"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Select</option>
                {state.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {state.clients.length === 0 && (
              <p className="text-sm text-muted">
                Add a client first in{" "}
                <a href="/studio/clients" className="text-gold">
                  Clients
                </a>
                .
              </p>
            )}
            <label>
              <span className="label">Your field</span>
              <select
                className="field"
                value={brief.field}
                onChange={(e) => patch({ field: e.target.value })}
              >
                {CREATIVE_FIELDS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Project type / title</span>
              <input
                className="field"
                value={brief.projectType}
                onChange={(e) => {
                  patch({ projectType: e.target.value });
                  if (!title) setTitle(`${e.target.value} agreement`);
                }}
                placeholder="Brand film, dashboard build, campaign content…"
              />
            </label>
            <label>
              <span className="label">Agreement title</span>
              <input
                className="field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <label>
              <span className="label">Deliverables</span>
              <textarea
                className="field min-h-28"
                value={brief.deliverables}
                onChange={(e) => patch({ deliverables: e.target.value })}
                placeholder="Be specific: files, formats, round count, what is not included."
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="label">Start date</span>
                <input
                  className="field"
                  type="date"
                  value={brief.startDate}
                  onChange={(e) => patch({ startDate: e.target.value })}
                />
              </label>
              <label>
                <span className="label">Deadline</span>
                <input
                  className="field"
                  type="date"
                  value={brief.deadline}
                  onChange={(e) => patch({ deadline: e.target.value })}
                />
              </label>
            </div>
            <label>
              <span className="label">Revisions included</span>
              <input
                className="field"
                value={brief.revisions}
                onChange={(e) => patch({ revisions: e.target.value })}
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <label>
              <span className="label">Mode of payment</span>
              <input
                className="field"
                value={brief.paymentMode}
                onChange={(e) => patch({ paymentMode: e.target.value })}
                placeholder="50/50, milestones, net 14…"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="label">Total fee (number)</span>
                <input
                  className="field"
                  value={brief.totalFee}
                  onChange={(e) => patch({ totalFee: e.target.value })}
                />
              </label>
              <label>
                <span className="label">Currency</span>
                <select
                  className="field"
                  value={brief.currency}
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
            <label>
              <span className="label">Late fee</span>
              <input
                className="field"
                value={brief.lateFee}
                onChange={(e) => patch({ lateFee: e.target.value })}
              />
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <label>
              <span className="label">Who owns the work</span>
              <textarea
                className="field min-h-20"
                value={brief.ipOwnership}
                onChange={(e) => patch({ ipOwnership: e.target.value })}
              />
            </label>
            <label>
              <span className="label">Usage rights</span>
              <textarea
                className="field min-h-20"
                value={brief.usageRights}
                onChange={(e) => patch({ usageRights: e.target.value })}
              />
            </label>
            <label>
              <span className="label">Kill / cancellation fee</span>
              <input
                className="field"
                value={brief.killFee}
                onChange={(e) => patch({ killFee: e.target.value })}
              />
            </label>
          </>
        )}

        {step === 4 && (
          <>
            <label>
              <span className="label">Governing law / jurisdiction</span>
              <input
                className="field"
                value={brief.jurisdiction}
                onChange={(e) => patch({ jurisdiction: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={brief.confidentiality}
                onChange={(e) => patch({ confidentiality: e.target.checked })}
              />
              Include a confidentiality clause
            </label>
            <label>
              <span className="label">Anything else the agreement must say</span>
              <textarea
                className="field min-h-28"
                value={brief.extras}
                onChange={(e) => patch({ extras: e.target.value })}
              />
            </label>
            <p className="text-sm text-muted">
              {state.aiCredits > 0
                ? `This will use 1 of your ${state.aiCredits} AI credits.`
                : `Generating costs ₦${AI_AGREEMENT_PRICE.toLocaleString("en-NG")}.`}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          className="btn btn-ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </button>
        {step < WIZARD_STEPS.length - 1 ? (
          <button
            className="btn btn-gold"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue {I.arrow({ size: 16 })}
          </button>
        ) : (
          <button className="btn btn-gold" onClick={tryGenerate}>
            {I.spark({ size: 16 })} Generate agreement
          </button>
        )}
      </div>

      <PayModal
        open={payOpen}
        title="AI agreement"
        amount={AI_AGREEMENT_PRICE}
        copy="One generated contract, written from this brief. You can edit every clause after."
        onClose={() => setPayOpen(false)}
        onConfirm={() => {
          setPayOpen(false);
          generate();
        }}
      />
    </div>
  );
}
