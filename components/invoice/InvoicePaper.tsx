import { forwardRef } from "react";
import { invoiceTotals, money, prettyDate } from "@/lib/format";
import { getTemplate } from "@/lib/templates";
import type { Agreement, Client, Invoice, Profile } from "@/lib/types";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status status-${status}`}>{status}</span>;
}

export const InvoicePaper = forwardRef<
  HTMLElement,
  {
    invoice: Invoice;
    client?: Client;
    profile: Profile;
    agreement?: Agreement;
    compact?: boolean;
  }
>(function InvoicePaper(
  { invoice, client, profile, agreement, compact = false },
  ref,
) {
  const tpl = getTemplate(invoice.style.templateId);
  const dark = tpl.layout === "studio";
  const totals = invoiceTotals(invoice);
  const paper = invoice.style.templateId ? tpl.paper : "#f4efe6";
  const ink = tpl.ink;
  const muted = tpl.muted;
  const accent = invoice.style.accent || tpl.accent;
  const serif = invoice.style.font !== "sans";
  const pad = compact ? "p-6 md:p-8" : "p-8 md:p-12";

  return (
    <article
      ref={ref}
      className={`print-sheet paper-shadow relative overflow-hidden ${pad}`}
      style={{
        background: paper,
        color: ink,
        fontFamily: serif
          ? 'var(--font-instrument), "Times New Roman", serif'
          : "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {tpl.layout === "bold" && (
        <div className="absolute inset-x-0 top-0 h-2" style={{ background: accent }} />
      )}
      {tpl.layout === "ledger" && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      <header className="relative flex items-start justify-between gap-6">
        <div>
          {invoice.style.showLogo && invoice.style.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={invoice.style.logoDataUrl}
              alt=""
              crossOrigin="anonymous"
              className="mb-3 h-10 w-auto object-contain"
            />
          ) : (
            <p
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: accent }}
            >
              {profile.business || "Your studio"}
            </p>
          )}
          <h1
            className={`${tpl.layout === "bold" || tpl.layout === "editorial" ? "text-5xl md:text-6xl" : "text-4xl"} leading-none`}
          >
            Invoice
          </h1>
          <p className="mt-2 font-mono text-xs tracking-wide" style={{ color: muted }}>
            {invoice.number}
          </p>
        </div>
        <div className="text-right text-sm" style={{ color: muted }}>
          <p style={{ color: ink }}>{profile.name}</p>
          <p>{profile.role}</p>
          <p>{profile.email}</p>
          <p>{profile.phone}</p>
          <p className="mt-1 max-w-[14rem]">{profile.address}</p>
        </div>
      </header>

      <div
        className="my-8 h-px"
        style={{ background: dark ? "rgba(255,255,255,0.12)" : "#ddd4c4" }}
      />

      <div className="grid gap-8 text-sm md:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>
            Billed to
          </p>
          <p className="mt-1 text-base" style={{ color: ink }}>
            {client?.name || "Client name"}
          </p>
          {client?.company && <p>{client.company}</p>}
          <p style={{ color: muted }}>{client?.email}</p>
          <p style={{ color: muted }}>{client?.address}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>
            Project
          </p>
          <p className="mt-1 text-base">{invoice.projectName || "Untitled project"}</p>
          {agreement && (
            <p className="mt-2 text-xs" style={{ color: accent }}>
              Agreement attached · {agreement.title}
            </p>
          )}
        </div>
        <div className="md:text-right">
          <Meta label="Issued" value={prettyDate(invoice.issueDate)} muted={muted} />
          <Meta label="Due" value={prettyDate(invoice.dueDate)} muted={muted} />
          <Meta label="Terms" value={invoice.paymentTerms || "—"} muted={muted} />
        </div>
      </div>

      <table className="mt-10 w-full text-sm">
        <thead>
          <tr
            className="text-left text-[10px] uppercase tracking-[0.16em]"
            style={{ color: muted, borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "#ddd4c4"}` }}
          >
            <th className="pb-2 font-normal">Description</th>
            <th className="pb-2 text-right font-normal">Qty</th>
            <th className="pb-2 text-right font-normal">Rate</th>
            <th className="pb-2 text-right font-normal">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr
              key={item.id}
              style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#eee6d8"}` }}
            >
              <td className="py-3 pr-4">{item.description || "—"}</td>
              <td className="py-3 text-right font-mono text-xs">{item.quantity}</td>
              <td className="py-3 text-right font-mono text-xs">
                {money(item.rate, invoice.currency)}
              </td>
              <td className="py-3 text-right font-mono text-xs">
                {money(item.quantity * item.rate, invoice.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 flex justify-end">
        <dl className="w-56 space-y-1.5 text-sm">
          <Row label="Subtotal" value={money(totals.subtotal, invoice.currency)} muted={muted} />
          {totals.discount > 0 && (
            <Row
              label={invoice.discountType === "percent" ? `Discount (${invoice.discount}%)` : "Discount"}
              value={`− ${money(totals.discount, invoice.currency)}`}
              muted={muted}
            />
          )}
          {invoice.taxRate > 0 && (
            <Row
              label={`Tax (${invoice.taxRate}%)`}
              value={money(totals.tax, invoice.currency)}
              muted={muted}
            />
          )}
          <div
            className="my-2 h-px"
            style={{ background: dark ? "rgba(255,255,255,0.12)" : "#ddd4c4" }}
          />
          <Row label="Total" value={money(totals.total, invoice.currency)} strong accent={accent} />
          {invoice.depositPercent > 0 && (
            <Row
              label={`Deposit (${invoice.depositPercent}%)`}
              value={money(totals.deposit, invoice.currency)}
              muted={muted}
            />
          )}
          {invoice.paidAmount > 0 && (
            <Row
              label="Paid"
              value={money(invoice.paidAmount, invoice.currency)}
              muted={muted}
            />
          )}
          <Row label="Balance due" value={money(totals.balance, invoice.currency)} strong />
        </dl>
      </div>

      {(invoice.notes || profile.bankName) && (
        <div
          className="mt-10 grid gap-6 text-sm md:grid-cols-2"
          style={{ color: muted }}
        >
          {invoice.notes && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em]">Notes</p>
              <p className="mt-1" style={{ color: ink }}>
                {invoice.notes}
              </p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em]">Pay</p>
            <p className="mt-1" style={{ color: ink }}>
              {profile.bankName} · {profile.accountName}
            </p>
            <p className="font-mono text-xs">{profile.accountNumber}</p>
            {profile.taxId && <p>Tax ID {profile.taxId}</p>}
          </div>
        </div>
      )}

      <footer
        className="mt-12 flex items-end justify-between text-xs"
        style={{ color: muted }}
      >
        <p>{invoice.style.footer}</p>
        <p style={{ color: accent }}>{tpl.name}</p>
      </footer>
    </article>
  );
});

InvoicePaper.displayName = "InvoicePaper";

function Meta({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted: string;
}) {
  return (
    <p>
      <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: muted }}>
        {label}{" "}
      </span>
      {value}
    </p>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
  accent,
}: {
  label: string;
  value: string;
  muted?: string;
  strong?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex justify-between gap-6">
      <dt style={{ color: muted }}>{label}</dt>
      <dd className={strong ? "font-medium" : "font-mono text-xs"} style={{ color: accent }}>
        {value}
      </dd>
    </div>
  );
}
