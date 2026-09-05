"use client";

import { use } from "react";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";

export default function InvoiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <InvoiceEditor invoiceId={id} />;
}
