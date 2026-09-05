import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { FREE_TEMPLATE_IDS } from "./templates";
import { emptyState } from "./seed";
import type { Agreement, Client, Invoice, Profile, StoreState } from "./types";

function requireDb() {
  if (!db) throw new Error("Firebase is not configured.");
  return db;
}

function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function loadStudio(uid: string): Promise<StoreState> {
  const firestore = requireDb();
  const studioSnap = await getDoc(doc(firestore, "studios", uid));
  const base = emptyState();

  const [clientsSnap, invoicesSnap, agreementsSnap] = await Promise.all([
    getDocs(query(collection(firestore, "clients"), where("ownerId", "==", uid))),
    getDocs(query(collection(firestore, "invoices"), where("ownerId", "==", uid))),
    getDocs(
      query(collection(firestore, "agreements"), where("ownerId", "==", uid)),
    ),
  ]);

  const studio = studioSnap.exists() ? studioSnap.data() : {};

  return {
    profile: { ...base.profile, ...(studio.profile as Profile | undefined) },
    ownedTemplateIds:
      (studio.ownedTemplateIds as string[] | undefined) ?? [...FREE_TEMPLATE_IDS],
    aiCredits: (studio.aiCredits as number | undefined) ?? 0,
    clients: clientsSnap.docs.map((d) => d.data() as Client),
    invoices: invoicesSnap.docs
      .map((d) => d.data() as Invoice)
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")),
    agreements: agreementsSnap.docs
      .map((d) => d.data() as Agreement)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
  };
}

export async function saveStudioDoc(
  uid: string,
  data: {
    profile: Profile;
    ownedTemplateIds: string[];
    aiCredits: number;
    email?: string;
  },
) {
  const firestore = requireDb();
  await setDoc(
    doc(firestore, "studios", uid),
    clean({
      ...data,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true },
  );
}

export async function upsertInvoice(invoice: Invoice) {
  const firestore = requireDb();
  await setDoc(doc(firestore, "invoices", invoice.id), clean(invoice), {
    merge: true,
  });
}

export async function removeInvoice(id: string) {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "invoices", id));
}

export async function upsertClient(client: Client) {
  const firestore = requireDb();
  await setDoc(doc(firestore, "clients", client.id), clean(client), {
    merge: true,
  });
}

export async function removeClient(id: string) {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "clients", id));
}

export async function upsertAgreement(agreement: Agreement) {
  const firestore = requireDb();
  await setDoc(doc(firestore, "agreements", agreement.id), clean(agreement), {
    merge: true,
  });
}

export async function removeAgreement(id: string) {
  const firestore = requireDb();
  await deleteDoc(doc(firestore, "agreements", id));
}

export async function fetchPublicInvoice(id: string): Promise<Invoice | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "invoices", id));
  return snap.exists() ? (snap.data() as Invoice) : null;
}

export async function fetchPublicAgreement(
  id: string,
): Promise<Agreement | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "agreements", id));
  return snap.exists() ? (snap.data() as Agreement) : null;
}

export async function markInvoiceViewedOrPaid(
  id: string,
  status: "viewed" | "partial",
) {
  if (!db) return;
  await updateDoc(doc(db, "invoices", id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function signPublicAgreement(
  id: string,
  signerName: string,
) {
  if (!db) return;
  await updateDoc(doc(db, "agreements", id), {
    status: "signed",
    signerName,
    signedAt: new Date().toISOString(),
  });
}
