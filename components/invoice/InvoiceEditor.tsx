"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InvoicePaper } from "@/components/invoice/InvoicePaper";
import { InvoiceShareBar } from "@/components/invoice/InvoiceShareBar";
import { I } from "@/components/icons";
import { isCloudinaryConfigured } from "@/lib/config";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { invoiceTotals, money, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import { getTemplate, TEMPLATES } from "@/lib/templates";
import type { Currency, Invoice, InvoiceStatus, LineItem } from "@/lib/types";

const STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "viewed",
  "partial",
  "paid",
  "overdue",
  "void",
];

export function InvoiceEditor({ invoiceId }: { invoiceId: string }) {
  const {
    invoiceById,
    clientById,
    agreementById,
    saveInvoice,
    deleteInvoice,
    duplicateInvoice,
    state,
    ownsTemplate,
  } = useStore();
  const stored = invoiceById(invoiceId);
  const [invoice, setInvoice] = useState<Invoice | null>(stored || null);
  const [tab, setTab] = useState<"details" | "look">("details");
  const [logoBusy, setLogoBusy] = useState(false);
  const paperRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (stored) setInvoice(stored);
  }, [stored]);

  const client = invoice
    ? clientById(invoice.clientId) || invoice.clientSnapshot
    : undefined;
  const agreement = invoice?.agreementId
    ? agreementById(invoice.agreementId) || invoice.agreementSnapshot
    : undefined;
  const totals = useMemo(
    () => (invoice ? invoiceTotals(invoice) : null),
    [invoice],
  );

  if (!invoice) {
    return (
      <p className="text-muted">
        Invoice not found. <Link href="/studio/invoices">Back</Link>
      </p>
    );
  }

  function patch(p: Partial<Invoice>) {
    setInvoice((prev) => (prev ? { ...prev, ...p } : prev));
  }

  function patchItem(id: string, p: Partial<LineItem>) {
    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) => (it.id === id ? { ...it, ...p } : it)),
          }
        : prev,
    );
  }

  function save() {
    if (invoice) saveInvoice(invoice);
  }

  const available = TEMPLATES.filter(
    (t) => t.kind === "invoice" && (ownsTemplate(t.id) || !t.premium),
  );

  return (
    <div>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/studio/invoices" className="text-xs uppercase tracking-[0.16em] text-muted">
            ← Invoices
          </Link>
          <h1 className="font-serif mt-1 text-3xl">{invoice.number}</h1>
          <p className="text-sm text-muted">{invoice.projectName || "Untitled project"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/studio/prompt/${invoice.id}`} className="btn btn-ghost">
            {I.chat({ size: 15 })} Chat
          </Link>
          <Link href={`/i/${invoice.id}`} className="btn btn-ghost" target="_blank">
            Preview
          </Link>
          <button
            className="btn btn-ghost"
            onClick={() => {
              const copy = duplicateInvoice(invoice);
              router.push(`/studio/invoices/${copy.id}`);
            }}
          >
            Duplicate
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              save();
              window.print();
            }}
          >
            {I.print({ size: 15 })} Print
          </button>
          <button className="btn btn-gold" onClick={save}>
            Save
          </button>
        </div>
      </div>

      <div className="no-print mt-5 rounded-2xl border border-line bg-bg2 p-4">
        <InvoiceShareBar
          invoice={invoice}
          paperRef={paperRef}
          onPdfUrl={(pdfUrl) => {
            const next = { ...invoice, pdfUrl };
            setInvoice(next);
            saveInvoice(next);
          }}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="no-print">
          <div className="mb-4 flex gap-2">
            {(["details", "look"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-gold text-ink" : "border border-line text-muted"}`}
              >
                {t === "look" ? "Customize" : "Details"}
              </button>
            ))}
          </div>

          {tab === "details" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="label">Client</span>
                  <select
                    className="field"
                    value={invoice.clientId}
                    onChange={(e) => patch({ clientId: e.target.value })}
                  >
                    <option value="">Select client</option>
                    {state.clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.company ? ` · ${c.company}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Status</span>
                  <select
                    className="field"
                    value={invoice.status}
                    onChange={(e) =>
                      patch({ status: e.target.value as InvoiceStatus })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span className="label">Project</span>
                <input
                  className="field"
                  value={invoice.projectName}
                  onChange={(e) => patch({ projectName: e.target.value })}
                  placeholder="What is this invoice for?"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label>
                  <span className="label">Issue date</span>
                  <input
                    className="field"
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => patch({ issueDate: e.target.value })}
                  />
                </label>
                <label>
                  <span className="label">Due date</span>
                  <input
                    className="field"
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => patch({ dueDate: e.target.value })}
                  />
                </label>
                <label>
                  <span className="label">Currency</span>
                  <select
                    className="field"
                    value={invoice.currency}
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="label !mb-0">Line items</span>
                  <button
                    className="text-sm text-gold"
                    onClick={() =>
                      patch({
                        items: [
                          ...invoice.items,
                          { id: uid("li"), description: "", quantity: 1, rate: 0 },
                        ],
                      })
                    }
                  >
                    Add line
                  </button>
                </div>
                <div className="space-y-2">
                  {invoice.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_70px_110px_28px] gap-2"
                    >
                      <input
                        className="field"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          patchItem(item.id, { description: e.target.value })
                        }
                      />
                      <input
                        className="field"
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) =>
                          patchItem(item.id, {
                            quantity: Number(e.target.value),
                          })
                        }
                      />
                      <input
                        className="field"
                        type="number"
                        min={0}
                        value={item.rate}
                        onChange={(e) =>
                          patchItem(item.id, { rate: Number(e.target.value) })
                        }
                      />
                      <button
                        className="text-muted hover:text-danger"
                        onClick={() =>
                          patch({
                            items: invoice.items.filter((i) => i.id !== item.id),
                          })
                        }
                      >
                        {I.x({ size: 14 })}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <label>
                  <span className="label">Tax %</span>
                  <input
                    className="field"
                    type="number"
                    value={invoice.taxRate}
                    onChange={(e) => patch({ taxRate: Number(e.target.value) })}
                  />
                </label>
                <label>
                  <span className="label">Discount</span>
                  <input
                    className="field"
                    type="number"
                    value={invoice.discount}
                    onChange={(e) => patch({ discount: Number(e.target.value) })}
                  />
                </label>
                <label>
                  <span className="label">Discount type</span>
                  <select
                    className="field"
                    value={invoice.discountType}
                    onChange={(e) =>
                      patch({
                        discountType: e.target.value as "percent" | "fixed",
                      })
                    }
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </label>
                <label>
                  <span className="label">Deposit %</span>
                  <input
                    className="field"
                    type="number"
                    value={invoice.depositPercent}
                    onChange={(e) =>
                      patch({ depositPercent: Number(e.target.value) })
                    }
                  />
                </label>
              </div>

              <label>
                <span className="label">Payment terms</span>
                <input
                  className="field"
                  value={invoice.paymentTerms}
                  onChange={(e) => patch({ paymentTerms: e.target.value })}
                />
              </label>
              <label>
                <span className="label">Notes</span>
                <textarea
                  className="field min-h-24"
                  value={invoice.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="label">Amount already paid</span>
                  <input
                    className="field"
                    type="number"
                    value={invoice.paidAmount}
                    onChange={(e) =>
                      patch({ paidAmount: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  <span className="label">Attach agreement</span>
                  <select
                    className="field"
                    value={invoice.agreementId || ""}
                    onChange={(e) =>
                      patch({ agreementId: e.target.value || undefined })
                    }
                  >
                    <option value="">None</option>
                    {state.agreements.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {totals && (
                <p className="text-sm text-muted">
                  Total {money(totals.total, invoice.currency)} · Balance{" "}
                  {money(totals.balance, invoice.currency)}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    const next = { ...invoice, status: "sent" as const };
                    setInvoice(next);
                    saveInvoice(next);
                  }}
                >
                  Mark sent
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    const paid = invoiceTotals(invoice).total;
                    const next = {
                      ...invoice,
                      status: "paid" as const,
                      paidAmount: paid,
                    };
                    setInvoice(next);
                    saveInvoice(next);
                  }}
                >
                  Mark paid
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    deleteInvoice(invoice.id);
                    router.push("/studio/invoices");
                  }}
                >
                  {I.trash({ size: 14 })} Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <span className="label">Layout</span>
                <div className="grid grid-cols-2 gap-2">
                  {available.map((t) => (
                    <button
                      key={t.id}
                      onClick={() =>
                        patch({
                          style: {
                            ...invoice.style,
                            templateId: t.id,
                            accent: t.accent,
                          },
                        })
                      }
                      className={`rounded-xl border p-3 text-left ${invoice.style.templateId === t.id ? "border-gold" : "border-line"}`}
                    >
                      <span
                        className="block h-8 rounded-md"
                        style={{ background: t.paper, borderTop: `3px solid ${t.accent}` }}
                      />
                      <span className="mt-2 block text-sm">{t.name}</span>
                    </button>
                  ))}
                </div>
                <Link href="/studio/templates" className="mt-2 inline-block text-xs text-gold">
                  Get premium templates →
                </Link>
              </div>
              <label>
                <span className="label">Accent colour</span>
                <input
                  className="h-10 w-full cursor-pointer rounded-lg border border-line bg-transparent"
                  type="color"
                  value={invoice.style.accent}
                  onChange={(e) =>
                    patch({ style: { ...invoice.style, accent: e.target.value } })
                  }
                />
              </label>
              <label>
                <span className="label">Type</span>
                <select
                  className="field"
                  value={invoice.style.font}
                  onChange={(e) =>
                    patch({
                      style: {
                        ...invoice.style,
                        font: e.target.value as "serif" | "sans",
                      },
                    })
                  }
                >
                  <option value="serif">Serif — editorial</option>
                  <option value="sans">Sans — technical</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={invoice.style.showLogo}
                  onChange={(e) =>
                    patch({
                      style: { ...invoice.style, showLogo: e.target.checked },
                    })
                  }
                />
                Show logo / studio name
              </label>
              <label>
                <span className="label">
                  Logo image {isCloudinaryConfigured() ? "· Cloudinary" : ""}
                  {logoBusy ? " · uploading…" : ""}
                </span>
                <input
                  className="field"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLogoBusy(true);
                    try {
                      if (isCloudinaryConfigured()) {
                        const uploaded = await uploadImageToCloudinary(file);
                        patch({
                          style: {
                            ...invoice.style,
                            logoDataUrl: uploaded.url,
                            showLogo: true,
                          },
                        });
                      } else {
                        const reader = new FileReader();
                        reader.onload = () =>
                          patch({
                            style: {
                              ...invoice.style,
                              logoDataUrl: String(reader.result),
                              showLogo: true,
                            },
                          });
                        reader.readAsDataURL(file);
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setLogoBusy(false);
                    }
                  }}
                />
              </label>
              <label>
                <span className="label">Footer line</span>
                <input
                  className="field"
                  value={invoice.style.footer}
                  onChange={(e) =>
                    patch({ style: { ...invoice.style, footer: e.target.value } })
                  }
                />
              </label>
              <p className="text-xs text-muted">
                Using {getTemplate(invoice.style.templateId).name}. Changes save
                with the invoice.
              </p>
            </div>
          )}
        </div>

        <div className="xl:sticky xl:top-8">
          <InvoicePaper
            ref={paperRef}
            invoice={invoice}
            client={client}
            profile={state.profile}
            agreement={agreement}
          />
        </div>
      </div>
    </div>
  );
}
