"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function NewInvoicePage() {
  const { newInvoice, saveInvoice } = useStore();
  const router = useRouter();
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    const invoice = newInvoice();
    saveInvoice(invoice);
    router.replace(`/studio/invoices/${invoice.id}`);
  }, [newInvoice, saveInvoice, router]);

  return <p className="text-muted">Opening a new invoice…</p>;
}
