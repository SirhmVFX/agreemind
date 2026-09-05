"use client";

import { use } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { InvoicePaper, StatusBadge } from "@/components/invoice/InvoicePaper";
import { InvoiceShareBar } from "@/components/invoice/InvoiceShareBar";
import { Logo } from "@/components/brand/Logo";
import { isOverdue } from "@/lib/format";
import { markInvoiceViewedOrPaid } from "@/lib/persist";
import { usePublicInvoice } from "@/lib/public";
import { isFirebaseConfigured } from "@/lib/config";
import { useStore } from "@/lib/store";

export default function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { loading, invoice, setInvoice, client, profile, agreement } =
    usePublicInvoice(id);
  const { saveInvoice, firebaseOn } = useStore();
  const paperRef = useRef<HTMLElement | null>(null);
  const [marked, setMarked] = useState(false);
  const viewed = useRef(false);

  useEffect(() => {
    if (!invoice || viewed.current) return;
    if (invoice.status !== "sent") return;
    viewed.current = true;
    const next = { ...invoice, status: "viewed" as const };
    setInvoice(next);
    if (isFirebaseConfigured()) void markInvoiceViewedOrPaid(invoice.id, "viewed");
    else saveInvoice(next);
  }, [invoice, saveInvoice, setInvoice]);

  if (loading) return <p className="p-10 text-muted">Loading invoice…</p>;
  if (!invoice) {
    return (
      <div className="p-10">
        <Logo />
        <p className="mt-8 text-muted">
          This invoice is not available. Ask the studio to send the link again.
        </p>
      </div>
    );
  }

  const status = isOverdue(invoice) ? "overdue" : invoice.status;

  return (
    <div className="min-h-screen bg-bg pb-16">
      <header className="no-print mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Logo />
        <StatusBadge status={status} />
      </header>
      <div className="no-print mx-auto mb-6 max-w-3xl px-5">
        <InvoiceShareBar invoice={invoice} paperRef={paperRef} />
      </div>
      <div className="mx-auto max-w-3xl px-5">
        <InvoicePaper
          ref={paperRef}
          invoice={invoice}
          client={client}
          profile={profile}
          agreement={agreement}
        />
        {agreement && (
          <p className="no-print mt-6 text-center text-sm text-muted">
            A project agreement is attached.{" "}
            <Link href={`/a/${agreement.id}`} className="text-gold">
              Read and sign it →
            </Link>
          </p>
        )}
        {invoice.status !== "paid" && invoice.status !== "void" && (
          <div className="no-print mt-6 text-center">
            <button
              className="btn btn-gold"
              disabled={marked}
              onClick={async () => {
                const next = { ...invoice, status: "partial" as const };
                setInvoice(next);
                if (firebaseOn || isFirebaseConfigured()) {
                  await markInvoiceViewedOrPaid(invoice.id, "partial");
                } else {
                  saveInvoice(next);
                }
                setMarked(true);
              }}
            >
              {marked ? "Studio notified" : "I’ve sent payment"}
            </button>
            <p className="mt-2 text-xs text-muted">
              Tells the studio you paid. They still confirm against the bank.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
