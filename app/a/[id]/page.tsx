"use client";

import { use } from "react";
import { useState } from "react";
import { AgreementPaper } from "@/components/agreement/AgreementPaper";
import { Logo } from "@/components/brand/Logo";
import { I } from "@/components/icons";
import { isFirebaseConfigured } from "@/lib/config";
import { signPublicAgreement } from "@/lib/persist";
import { usePublicAgreement } from "@/lib/public";
import { useStore } from "@/lib/store";

export default function PublicAgreementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { loading, agreement, setAgreement, client, profile } =
    usePublicAgreement(id);
  const { saveAgreement } = useStore();
  const [name, setName] = useState("");

  if (loading) return <p className="p-10 text-muted">Loading agreement…</p>;
  if (!agreement) {
    return (
      <div className="p-10">
        <Logo />
        <p className="mt-8 text-muted">
          This agreement is not available. Ask the studio for a new link.
        </p>
      </div>
    );
  }

  const signed = agreement.status === "signed";

  return (
    <div className="min-h-screen bg-bg pb-16">
      <header className="no-print mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Logo />
        <button className="btn btn-ghost !py-1.5" onClick={() => window.print()}>
          {I.print({ size: 15 })} Print
        </button>
      </header>
      <div className="mx-auto max-w-3xl px-5">
        <AgreementPaper
          agreement={agreement}
          client={client}
          profile={profile}
        />
        {!signed ? (
          <form
            className="no-print mt-8 rounded-2xl border border-line bg-bg2 p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const next = {
                ...agreement,
                status: "signed" as const,
                signerName: name,
                signedAt: new Date().toISOString(),
              };
              setAgreement(next);
              if (isFirebaseConfigured()) {
                await signPublicAgreement(agreement.id, name);
              } else {
                saveAgreement(next);
              }
            }}
          >
            <h2 className="font-serif text-2xl">Sign this agreement</h2>
            <p className="mt-2 text-sm text-muted">
              Type your full name to accept the terms on behalf of{" "}
              {client?.company || client?.name || "the client"}.
            </p>
            <input
              className="field mt-4"
              placeholder="Full legal name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button className="btn btn-gold mt-4" type="submit">
              Agree and sign
            </button>
          </form>
        ) : (
          <p className="no-print mt-8 text-center text-sage">
            Signed by {agreement.signerName}.
          </p>
        )}
      </div>
    </div>
  );
}
