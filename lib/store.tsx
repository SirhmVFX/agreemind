"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateAuthProfile,
} from "firebase/auth";
import { addDaysISO, nextInvoiceNumber, todayISO, uid as makeId } from "./format";
import { isFirebaseConfigured } from "./config";
import { auth } from "./firebase";
import {
  loadStudio,
  removeAgreement,
  removeClient,
  removeInvoice,
  saveStudioDoc,
  upsertAgreement,
  upsertClient,
  upsertInvoice,
} from "./persist";
import { emptyState, seedState } from "./seed";
import { FREE_TEMPLATE_IDS } from "./templates";
import type {
  Agreement,
  Client,
  Invoice,
  Profile,
  Session,
  StoreState,
} from "./types";

const STORE_KEY = "agreemind.store.v1";
const SESSION_KEY = "agreemind.session.v1";

function loadLocalStore(): StoreState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as StoreState;
    if (!parsed?.profile || !Array.isArray(parsed.invoices)) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

function loadLocalSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

type StoreApi = {
  ready: boolean;
  firebaseOn: boolean;
  uid: string | null;
  session: Session | null;
  state: StoreState;
  signInDemo: () => void;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => void;
  saveClient: (client: Omit<Client, "createdAt"> & { createdAt?: string }) => void;
  deleteClient: (id: string) => void;
  saveInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (invoice: Invoice) => Invoice;
  saveAgreement: (agreement: Agreement) => void;
  deleteAgreement: (id: string) => void;
  ownTemplate: (id: string) => void;
  addAiCredit: (n?: number) => void;
  spendAiCredit: () => boolean;
  newInvoice: (clientId?: string) => Invoice;
  clientById: (id: string) => Client | undefined;
  invoiceById: (id: string) => Invoice | undefined;
  agreementById: (id: string) => Agreement | undefined;
  ownsTemplate: (id: string) => boolean;
};

const StoreContext = createContext<StoreApi | null>(null);

function decorateInvoice(
  invoice: Invoice,
  state: StoreState,
  ownerId?: string | null,
): Invoice {
  const client = state.clients.find((c) => c.id === invoice.clientId);
  const agreement = invoice.agreementId
    ? state.agreements.find((a) => a.id === invoice.agreementId)
    : undefined;
  return {
    ...invoice,
    ownerId: ownerId || invoice.ownerId,
    clientSnapshot: client,
    profileSnapshot: state.profile,
    agreementSnapshot: agreement,
    updatedAt: new Date().toISOString(),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const firebaseOn = isFirebaseConfigured();
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<StoreState>(emptyState);
  const uidRef = useRef<string | null>(null);
  const demoRef = useRef(false);

  useEffect(() => {
    uidRef.current = uid;
  }, [uid]);

  useEffect(() => {
    if (!firebaseOn || !auth) {
      setState(loadLocalStore());
      setSession(loadLocalSession());
      setReady(true);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const local = loadLocalSession();
        if (local?.demo) {
          demoRef.current = true;
          setSession(local);
          setState(loadLocalStore());
          setReady(true);
          return;
        }
        setUid(null);
        setSession(null);
        setState(emptyState());
        setReady(true);
        return;
      }
      demoRef.current = false;
      setUid(user.uid);
      setSession({
        email: user.email || "",
        name: user.displayName || user.email || "Studio",
        uid: user.uid,
      });
      try {
        const studio = await loadStudio(user.uid);
        if (!studio.profile.email) {
          studio.profile.email = user.email || "";
          studio.profile.name = studio.profile.name || user.displayName || "";
        }
        setState(studio);
      } catch (err) {
        console.error(err);
        setState(emptyState());
      }
      setReady(true);
    });

    return () => unsub();
  }, [firebaseOn]);

  useEffect(() => {
    if (!ready) return;
    if (firebaseOn && !session?.demo) return;
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state, ready, firebaseOn, session?.demo]);

  const persistStudio = useCallback(
    (next: StoreState, owner = uidRef.current) => {
      if (!firebaseOn || !owner) return;
      void saveStudioDoc(owner, {
        profile: next.profile,
        ownedTemplateIds: next.ownedTemplateIds,
        aiCredits: next.aiCredits,
        email: next.profile.email,
      });
    },
    [firebaseOn],
  );

  const signInDemo = useCallback(() => {
    demoRef.current = true;
    const next: Session = {
      name: "Adaeze Okonkwo",
      email: "ada@northlight.studio",
      demo: true,
    };
    setSession(next);
    setUid(null);
    setState(seedState());
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!auth) {
      const next: Session = { name: email.split("@")[0], email };
      setSession(next);
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpWithPassword = useCallback(
    async (name: string, email: string, password: string) => {
      if (!auth) {
        const next: Session = { name, email };
        setSession(next);
        setState({
          ...emptyState(),
          profile: { ...emptyProfileSafe(name, email) },
        });
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateAuthProfile(cred.user, { displayName: name });
      const fresh = {
        ...emptyState(),
        profile: { ...emptyProfileSafe(name, email) },
      };
      await saveStudioDoc(cred.user.uid, {
        profile: fresh.profile,
        ownedTemplateIds: fresh.ownedTemplateIds,
        aiCredits: 0,
        email,
      });
      setState(fresh);
    },
    [],
  );

  const signOut = useCallback(async () => {
    demoRef.current = false;
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setUid(null);
    setState(emptyState());
    if (auth && firebaseOn) await firebaseSignOut(auth);
  }, [firebaseOn]);

  const update = useCallback((fn: (prev: StoreState) => StoreState) => {
    setState((prev) => fn(prev));
  }, []);

  const api = useMemo<StoreApi>(() => {
    return {
      ready,
      firebaseOn,
      uid,
      session,
      state,
      signInDemo,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      updateProfile: (patch) =>
        update((s) => {
          const next = { ...s, profile: { ...s.profile, ...patch } };
          persistStudio(next);
          return next;
        }),
      saveClient: (client) =>
        update((s) => {
          const existing = s.clients.find((c) => c.id === client.id);
          const nextClient: Client = {
            createdAt: existing?.createdAt ?? todayISO(),
            ownerId: uidRef.current || undefined,
            ...client,
          };
          const next = {
            ...s,
            clients: existing
              ? s.clients.map((c) => (c.id === nextClient.id ? nextClient : c))
              : [nextClient, ...s.clients],
          };
          if (firebaseOn && uidRef.current) void upsertClient(nextClient);
          return next;
        }),
      deleteClient: (id) =>
        update((s) => {
          if (firebaseOn) void removeClient(id);
          return { ...s, clients: s.clients.filter((c) => c.id !== id) };
        }),
      saveInvoice: (invoice) =>
        update((s) => {
          const nextInvoice = decorateInvoice(invoice, s, uidRef.current);
          const existing = s.invoices.some((i) => i.id === nextInvoice.id);
          const next = {
            ...s,
            invoices: existing
              ? s.invoices.map((i) => (i.id === nextInvoice.id ? nextInvoice : i))
              : [nextInvoice, ...s.invoices],
          };
          if (firebaseOn && uidRef.current) void upsertInvoice(nextInvoice);
          return next;
        }),
      deleteInvoice: (id) =>
        update((s) => {
          if (firebaseOn) void removeInvoice(id);
          return { ...s, invoices: s.invoices.filter((i) => i.id !== id) };
        }),
      duplicateInvoice: (invoice) => {
        const copy: Invoice = decorateInvoice(
          {
            ...invoice,
            id: makeId("inv"),
            number: nextInvoiceNumber(state.invoices),
            status: "draft",
            paidAmount: 0,
            pdfUrl: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          state,
          uidRef.current,
        );
        update((s) => {
          const next = { ...s, invoices: [copy, ...s.invoices] };
          if (firebaseOn && uidRef.current) void upsertInvoice(copy);
          return next;
        });
        return copy;
      },
      saveAgreement: (agreement) =>
        update((s) => {
          const client = s.clients.find((c) => c.id === agreement.clientId);
          const nextAgreement: Agreement = {
            ...agreement,
            ownerId: uidRef.current || agreement.ownerId,
            clientSnapshot: client,
            profileSnapshot: s.profile,
          };
          const existing = s.agreements.some((a) => a.id === nextAgreement.id);
          if (firebaseOn && uidRef.current) void upsertAgreement(nextAgreement);
          return {
            ...s,
            agreements: existing
              ? s.agreements.map((a) =>
                  a.id === nextAgreement.id ? nextAgreement : a,
                )
              : [nextAgreement, ...s.agreements],
          };
        }),
      deleteAgreement: (id) =>
        update((s) => {
          if (firebaseOn) void removeAgreement(id);
          return {
            ...s,
            agreements: s.agreements.filter((a) => a.id !== id),
          };
        }),
      ownTemplate: (id) =>
        update((s) => {
          const next = {
            ...s,
            ownedTemplateIds: s.ownedTemplateIds.includes(id)
              ? s.ownedTemplateIds
              : [...s.ownedTemplateIds, id],
          };
          persistStudio(next);
          return next;
        }),
      addAiCredit: (n = 1) =>
        update((s) => {
          const next = { ...s, aiCredits: s.aiCredits + n };
          persistStudio(next);
          return next;
        }),
      spendAiCredit: () => {
        if (state.aiCredits < 1) return false;
        update((s) => {
          const next = { ...s, aiCredits: Math.max(0, s.aiCredits - 1) };
          persistStudio(next);
          return next;
        });
        return true;
      },
      newInvoice: (clientId) => {
        const invoice: Invoice = {
          id: makeId("inv"),
          number: nextInvoiceNumber(state.invoices),
          status: "draft",
          clientId: clientId || state.clients[0]?.id || "",
          projectName: "",
          issueDate: todayISO(),
          dueDate: addDaysISO(7),
          currency: state.profile.defaultCurrency,
          items: [
            {
              id: makeId("li"),
              description: "",
              quantity: 1,
              rate: 0,
            },
          ],
          taxRate: state.profile.defaultTaxRate,
          discount: 0,
          discountType: "percent",
          depositPercent: 50,
          notes: "",
          paymentTerms: state.profile.defaultPaymentTerms,
          style: {
            templateId: state.ownedTemplateIds[0] || "atelier",
            accent: "#1f3d2b",
            showLogo: true,
            font: "serif",
            footer: "Thank you for the work.",
          },
          paidAmount: 0,
          ownerId: uidRef.current || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return invoice;
      },
      clientById: (id) => state.clients.find((c) => c.id === id),
      invoiceById: (id) => state.invoices.find((i) => i.id === id),
      agreementById: (id) => state.agreements.find((a) => a.id === id),
      ownsTemplate: (id) =>
        FREE_TEMPLATE_IDS.includes(id) || state.ownedTemplateIds.includes(id),
    };
  }, [
    ready,
    firebaseOn,
    uid,
    session,
    state,
    signInDemo,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    update,
    persistStudio,
  ]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

function emptyProfileSafe(name: string, email: string): Profile {
  return {
    name,
    business: name,
    role: "",
    email,
    phone: "",
    address: "",
    taxId: "",
    website: "",
    bankName: "",
    accountName: name,
    accountNumber: "",
    defaultCurrency: "NGN",
    defaultTaxRate: 0,
    defaultPaymentTerms: "Due on receipt",
  };
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
