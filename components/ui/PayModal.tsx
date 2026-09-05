"use client";

import { useState, type ReactNode } from "react";
import { I } from "@/components/icons";
import { money } from "@/lib/format";

export function PayModal({
  open,
  title,
  amount,
  currency = "NGN",
  copy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  amount: number;
  currency?: "NGN" | "USD" | "GBP" | "EUR" | "CAD";
  copy: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
      <div className="w-full max-w-md rounded-2xl border border-line bg-bg2 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Checkout</p>
            <h2 className="font-serif mt-1 text-3xl">{title}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-fg">
            {I.x()}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">{copy}</p>
        <p className="mt-6 font-serif text-4xl text-gold2">{money(amount, currency)}</p>
        <p className="mt-1 text-xs text-muted">
          Demo checkout — no card is charged. This unlocks the item in your studio.
        </p>
        <button
          className="btn btn-gold mt-6 w-full"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            setTimeout(() => {
              onConfirm();
              setBusy(false);
            }, 700);
          }}
        >
          {busy ? "Confirming…" : "Pay and continue"}
        </button>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <h3 className="font-serif text-3xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{copy}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
