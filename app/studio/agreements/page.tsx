"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/invoice/InvoicePaper";
import { EmptyState } from "@/components/ui/PayModal";
import { I } from "@/components/icons";
import { prettyDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AgreementsPage() {
  const { state, clientById } = useStore();

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Agreements</h1>
          <p className="mt-1 text-sm text-muted">
            AI-written contracts you can attach to an invoice. {state.aiCredits} credit
            {state.aiCredits === 1 ? "" : "s"} left.
          </p>
        </div>
        <Link href="/studio/agreements/new" className="btn btn-gold">
          {I.spark({ size: 16 })} Generate agreement
        </Link>
      </div>

      {state.agreements.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No agreements yet"
            copy="Answer a short brief. AgreeMind writes scope, payment, IP, and kill-fee language for your field."
            action={
              <Link href="/studio/agreements/new" className="btn btn-gold">
                Start a brief
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line">
          {state.agreements.map((a) => (
            <Link
              key={a.id}
              href={`/studio/agreements/${a.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-bg2"
            >
              <div>
                <p>{a.title}</p>
                <p className="text-sm text-muted">
                  {clientById(a.clientId)?.name || "No client"} · {prettyDate(a.createdAt)}
                </p>
              </div>
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
