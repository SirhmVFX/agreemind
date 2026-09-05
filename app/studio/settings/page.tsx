"use client";

import { PayModal } from "@/components/ui/PayModal";
import { useEffect, useState } from "react";
import { isCloudinaryConfigured, isFirebaseConfigured } from "@/lib/config";
import { naira } from "@/lib/format";
import { AI_AGREEMENT_PRICE, STUDIO_PACK_PRICE } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import type { Currency, Profile } from "@/lib/types";

export default function SettingsPage() {
  const { state, updateProfile, addAiCredit, ownTemplate, firebaseOn } = useStore();
  const [profile, setProfile] = useState<Profile>(state.profile);
  const [saved, setSaved] = useState(false);
  const [buyCredits, setBuyCredits] = useState(false);
  const [buyPack, setBuyPack] = useState(false);

  useEffect(() => {
    setProfile(state.profile);
  }, [state.profile]);

  function patch(p: Partial<Profile>) {
    setProfile((prev) => ({ ...prev, ...p }));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-muted">
        This is what prints on every invoice.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <p className="rounded-xl border border-line px-4 py-3 text-sm">
          Firebase · {firebaseOn || isFirebaseConfigured() ? "connected" : "not configured"}
        </p>
        <p className="rounded-xl border border-line px-4 py-3 text-sm">
          Cloudinary · {isCloudinaryConfigured() ? "connected" : "not configured"}
        </p>
      </div>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfile(profile);
          setSaved(true);
          setTimeout(() => setSaved(false), 1600);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Your name" value={profile.name} onChange={(v) => patch({ name: v })} />
          <Field label="Studio / business" value={profile.business} onChange={(v) => patch({ business: v })} />
          <Field label="Field / role" value={profile.role} onChange={(v) => patch({ role: v })} />
          <Field label="Email" value={profile.email} onChange={(v) => patch({ email: v })} />
          <Field label="Phone" value={profile.phone} onChange={(v) => patch({ phone: v })} />
          <Field label="Website" value={profile.website} onChange={(v) => patch({ website: v })} />
        </div>
        <label>
          <span className="label">Address</span>
          <textarea
            className="field min-h-20"
            value={profile.address}
            onChange={(e) => patch({ address: e.target.value })}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Tax ID" value={profile.taxId} onChange={(v) => patch({ taxId: v })} />
          <label>
            <span className="label">Default currency</span>
            <select
              className="field"
              value={profile.defaultCurrency}
              onChange={(e) =>
                patch({ defaultCurrency: e.target.value as Currency })
              }
            >
              {["NGN", "USD", "GBP", "EUR", "CAD"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Field
            label="Default tax %"
            value={String(profile.defaultTaxRate)}
            onChange={(v) => patch({ defaultTaxRate: Number(v) || 0 })}
          />
        </div>
        <Field
          label="Default payment terms"
          value={profile.defaultPaymentTerms}
          onChange={(v) => patch({ defaultPaymentTerms: v })}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Bank" value={profile.bankName} onChange={(v) => patch({ bankName: v })} />
          <Field label="Account name" value={profile.accountName} onChange={(v) => patch({ accountName: v })} />
          <Field label="Account number" value={profile.accountNumber} onChange={(v) => patch({ accountNumber: v })} />
        </div>
        <button className="btn btn-gold">{saved ? "Saved" : "Save profile"}</button>
      </form>

      <section className="mt-14 border-t border-line pt-8">
        <h2 className="font-serif text-3xl">Credits & packs</h2>
        <p className="mt-2 text-sm text-muted">
          You have {state.aiCredits} AI agreement credit
          {state.aiCredits === 1 ? "" : "s"}.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn btn-gold" onClick={() => setBuyCredits(true)}>
            Buy 1 AI agreement · {naira(AI_AGREEMENT_PRICE)}
          </button>
          <button className="btn btn-ghost" onClick={() => setBuyPack(true)}>
            Studio pack · {naira(STUDIO_PACK_PRICE)}
          </button>
        </div>
      </section>

      <PayModal
        open={buyCredits}
        title="AI agreement credit"
        amount={AI_AGREEMENT_PRICE}
        copy="Adds one generation you can use on any brief."
        onClose={() => setBuyCredits(false)}
        onConfirm={() => {
          addAiCredit(1);
          setBuyCredits(false);
        }}
      />
      <PayModal
        open={buyPack}
        title="Studio pack"
        amount={STUDIO_PACK_PRICE}
        copy="Every premium template, plus five AI agreement credits."
        onClose={() => setBuyPack(false)}
        onConfirm={() => {
          addAiCredit(5);
          TEMPLATES.forEach((t) => ownTemplate(t.id));
          setBuyPack(false);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="field" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
