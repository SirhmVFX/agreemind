"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "./config";
import { fetchPublicAgreement, fetchPublicInvoice } from "./persist";
import { useStore } from "./store";
import type { Agreement, Client, Invoice, Profile } from "./types";

export function usePublicInvoice(id: string) {
  const { ready, invoiceById, clientById, agreementById, state } = useStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const local = invoiceById(id);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (isFirebaseConfigured()) {
        const doc = await fetchPublicInvoice(id);
        if (!cancelled) {
          setInvoice(doc);
          setLoading(false);
        }
        return;
      }
      if (!ready) return;
      if (!cancelled) {
        setInvoice(local || null);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, ready, local]);

  const client: Client | undefined =
    invoice?.clientSnapshot ||
    (invoice ? clientById(invoice.clientId) : undefined);
  const profile: Profile = invoice?.profileSnapshot || state.profile;
  const agreement: Agreement | undefined =
    invoice?.agreementSnapshot ||
    (invoice?.agreementId ? agreementById(invoice.agreementId) : undefined);

  return { loading, invoice, setInvoice, client, profile, agreement };
}

export function usePublicAgreement(id: string) {
  const { ready, agreementById, clientById, state } = useStore();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const local = agreementById(id);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (isFirebaseConfigured()) {
        const doc = await fetchPublicAgreement(id);
        if (!cancelled) {
          setAgreement(doc);
          setLoading(false);
        }
        return;
      }
      if (!ready) return;
      if (!cancelled) {
        setAgreement(local || null);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, ready, local]);

  const client =
    agreement?.clientSnapshot ||
    (agreement ? clientById(agreement.clientId) : undefined);
  const profile = agreement?.profileSnapshot || state.profile;

  return { loading, agreement, setAgreement, client, profile };
}
