"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { invoiceTotals, isOverdue, money, prettyDate } from "@/lib/format";
import { StatusBadge } from "@/components/invoice/InvoicePaper";
import { EmptyState } from "@/components/ui/PayModal";
import { I } from "@/components/icons";
import { invoiceShareUrl, shareInvoiceLink } from "@/lib/pdf";
import { useStore } from "@/lib/store";

export default function InvoicesPage() {
  const { state, clientById, duplicateInvoice } = useStore();
  const router = useRouter();

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Invoices</h1>
          <p className="mt-1 text-sm text-muted">
            {state.invoices.length} invoice{state.invoices.length === 1 ? "" : "s"} —
            create as many as you need. Download or share each one.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/studio/prompt" className="btn btn-ghost">
            {I.spark({ size: 16 })} From a brief
          </Link>
          <Link href="/studio/invoices/new" className="btn btn-gold">
            {I.plus({ size: 16 })} New invoice
          </Link>
        </div>
      </div>

      {state.invoices.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No invoices yet"
            copy="Paste a project document, or start a blank invoice. You can keep adding more."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/studio/prompt" className="btn btn-gold">
                  From a brief
                </Link>
                <Link href="/studio/invoices/new" className="btn btn-ghost">
                  Blank invoice
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-normal">Number</th>
                <th className="px-4 py-3 font-normal">Client</th>
                <th className="px-4 py-3 font-normal">Issued</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Total</th>
                <th className="px-4 py-3 font-normal">Share</th>
              </tr>
            </thead>
            <tbody>
              {state.invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/studio/invoices/${inv.id}`} className="text-gold2">
                      {inv.number}
                    </Link>
                    <p className="text-xs text-muted">{inv.projectName}</p>
                  </td>
                  <td className="px-4 py-3">
                    {clientById(inv.clientId)?.name || inv.clientSnapshot?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{prettyDate(inv.issueDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={isOverdue(inv) ? "overdue" : inv.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">
                    {money(invoiceTotals(inv).total, inv.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="text-xs text-gold"
                        onClick={() =>
                          shareInvoiceLink({
                            url: invoiceShareUrl(inv.id),
                            title: inv.number,
                            text: `Invoice ${inv.number}`,
                          })
                        }
                      >
                        Share
                      </button>
                      <button
                        className="text-xs text-muted hover:text-fg"
                        onClick={() => {
                          const copy = duplicateInvoice(inv);
                          router.push(`/studio/invoices/${copy.id}`);
                        }}
                      >
                        Duplicate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
