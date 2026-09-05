"use client";

import Link from "next/link";
import { invoiceTotals, isOverdue, money, prettyDate } from "@/lib/format";
import { StatusBadge } from "@/components/invoice/InvoicePaper";
import { I } from "@/components/icons";
import { useStore } from "@/lib/store";

export default function StudioHome() {
  const { state, clientById } = useStore();
  const invoices = state.invoices;
  const outstanding = invoices.reduce((s, inv) => {
    if (inv.status === "paid" || inv.status === "void") return s;
    return s + invoiceTotals(inv).balance;
  }, 0);
  const paid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + invoiceTotals(i).total, 0);
  const overdue = invoices.filter(isOverdue).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Studio</p>
          <h1 className="font-serif mt-1 text-4xl md:text-5xl">
            {state.profile.business || "Your studio"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {state.profile.role || `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/studio/prompt" className="btn btn-ghost">
            {I.spark({ size: 16 })} From a brief
          </Link>
          <Link href="/studio/agreements/new" className="btn btn-ghost">
            {I.spark({ size: 16 })} New agreement
          </Link>
          <Link href="/studio/invoices/new" className="btn btn-gold">
            {I.plus({ size: 16 })} New invoice
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <Stat label="Outstanding" value={money(outstanding, state.profile.defaultCurrency)} />
        <Stat label="Collected (paid invoices)" value={money(paid, state.profile.defaultCurrency)} />
        <Stat label="Overdue" value={String(overdue)} />
      </div>

      <h2 className="font-serif mt-12 text-2xl">Recent invoices</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-3 font-normal">Number</th>
              <th className="px-4 py-3 font-normal">Client</th>
              <th className="px-4 py-3 font-normal">Project</th>
              <th className="px-4 py-3 font-normal">Due</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 text-right font-normal">Balance</th>
            </tr>
          </thead>
          <tbody>
            {invoices.slice(0, 8).map((inv) => {
              const client = clientById(inv.clientId);
              const status = isOverdue(inv) ? "overdue" : inv.status;
              return (
                <tr key={inv.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/studio/invoices/${inv.id}`} className="text-gold2">
                      {inv.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{client?.name || "—"}</td>
                  <td className="px-4 py-3 text-muted">{inv.projectName}</td>
                  <td className="px-4 py-3 text-muted">{prettyDate(inv.dueDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    {money(invoiceTotals(inv).balance, inv.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg2 p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="font-serif mt-2 text-3xl">{value}</p>
    </div>
  );
}
