"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AgreementPaper } from "@/components/agreement/AgreementPaper";
import { I } from "@/components/icons";
import { useStore } from "@/lib/store";
import type { Agreement, AgreementStatus } from "@/lib/types";

export default function AgreementEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { agreementById, clientById, saveAgreement, deleteAgreement, state } =
    useStore();
  const stored = agreementById(id);
  const [agreement, setAgreement] = useState<Agreement | null>(stored || null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (stored) setAgreement(stored);
  }, [stored]);

  if (!agreement) {
    return (
      <p className="text-muted">
        Not found. <Link href="/studio/agreements">Back</Link>
      </p>
    );
  }

  const client = clientById(agreement.clientId);
  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/a/${agreement.id}` : "";

  return (
    <div>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/studio/agreements"
            className="text-xs uppercase tracking-[0.16em] text-muted"
          >
            ← Agreements
          </Link>
          <h1 className="font-serif mt-1 text-3xl">{agreement.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {I.copy({ size: 15 })} {copied ? "Copied" : "Client link"}
          </button>
          <Link href={`/a/${agreement.id}`} className="btn btn-ghost" target="_blank">
            Preview
          </Link>
          <button
            className="btn btn-ghost"
            onClick={() => {
              saveAgreement(agreement);
              window.print();
            }}
          >
            {I.print({ size: 15 })} Print
          </button>
          <button className="btn btn-gold" onClick={() => saveAgreement(agreement)}>
            Save
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="no-print space-y-4">
          <label>
            <span className="label">Title</span>
            <input
              className="field"
              value={agreement.title}
              onChange={(e) => setAgreement({ ...agreement, title: e.target.value })}
            />
          </label>
          <label>
            <span className="label">Status</span>
            <select
              className="field"
              value={agreement.status}
              onChange={(e) =>
                setAgreement({
                  ...agreement,
                  status: e.target.value as AgreementStatus,
                })
              }
            >
              {["draft", "sent", "signed", "declined"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Contract body — edit anything</span>
            <textarea
              className="field min-h-[28rem] font-serif text-[15px] leading-7"
              value={agreement.body}
              onChange={(e) => setAgreement({ ...agreement, body: e.target.value })}
            />
          </label>
          <button
            className="btn btn-danger"
            onClick={() => {
              deleteAgreement(agreement.id);
              router.push("/studio/agreements");
            }}
          >
            Delete
          </button>
        </div>
        <AgreementPaper
          agreement={agreement}
          client={client}
          profile={state.profile}
        />
      </div>
    </div>
  );
}
