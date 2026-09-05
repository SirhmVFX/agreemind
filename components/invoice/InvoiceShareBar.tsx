"use client";

import { useRef, useState, type RefObject } from "react";
import { I } from "@/components/icons";
import { isCloudinaryConfigured } from "@/lib/config";
import { uploadPdfToCloudinary } from "@/lib/cloudinary";
import { invoiceElementToPdf, invoiceShareUrl, shareInvoiceLink } from "@/lib/pdf";
import type { Invoice } from "@/lib/types";

export function InvoiceShareBar({
  invoice,
  paperRef,
  onPdfUrl,
  compact = false,
}: {
  invoice: Invoice;
  paperRef?: RefObject<HTMLElement | null>;
  onPdfUrl?: (url: string) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [note, setNote] = useState("");
  const localRef = useRef<HTMLElement | null>(null);
  const url = invoiceShareUrl(invoice.id);

  async function capturePdf() {
    const el = paperRef?.current || localRef.current;
    if (!el) throw new Error("Invoice paper is not ready.");
    return invoiceElementToPdf(el, `${invoice.number}.pdf`);
  }

  async function download() {
    setBusy("download");
    setNote("");
    try {
      const blob = await capturePdf();
      if (isCloudinaryConfigured() && onPdfUrl) {
        const uploaded = await uploadPdfToCloudinary(blob, `${invoice.number}.pdf`);
        onPdfUrl(uploaded.url);
      }
      setNote("Downloaded");
    } catch (err) {
      console.error(err);
      setNote("Could not download. Try print instead.");
    } finally {
      setBusy(null);
      setTimeout(() => setNote(""), 2000);
    }
  }

  async function share() {
    setBusy("share");
    setNote("");
    try {
      let file: File | undefined;
      try {
        const blob = await capturePdf();
        file = new File([blob], `${invoice.number}.pdf`, { type: "application/pdf" });
        if (isCloudinaryConfigured() && onPdfUrl) {
          const uploaded = await uploadPdfToCloudinary(blob, `${invoice.number}.pdf`);
          onPdfUrl(uploaded.url);
        }
      } catch {
        file = undefined;
      }

      const result = await shareInvoiceLink({
        url,
        title: `${invoice.number} · ${invoice.projectName || "Invoice"}`,
        text: `Invoice ${invoice.number}${invoice.projectName ? ` for ${invoice.projectName}` : ""}`,
        file,
      });
      setNote(result === "shared" ? "Shared" : "Link copied");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        await navigator.clipboard.writeText(url);
        setNote("Link copied");
      }
    } finally {
      setBusy(null);
      setTimeout(() => setNote(""), 2000);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setNote("Link copied");
    setTimeout(() => setNote(""), 2000);
  }

  const btn = compact ? "btn btn-ghost !px-3 !py-1.5 text-sm" : "btn btn-ghost";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={btn} onClick={download} disabled={!!busy}>
        {I.download({ size: 15 })} {busy === "download" ? "Preparing…" : "Download PDF"}
      </button>
      <button className={btn} onClick={share} disabled={!!busy}>
        {I.share({ size: 15 })} {busy === "share" ? "Sharing…" : "Share"}
      </button>
      <button className={btn} onClick={copyLink}>
        {I.copy({ size: 15 })} Copy link
      </button>
      <a
        className={btn}
        href={`https://wa.me/?text=${encodeURIComponent(`Invoice ${invoice.number}: ${url}`)}`}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
      {note && <span className="text-xs text-gold">{note}</span>}
    </div>
  );
}
