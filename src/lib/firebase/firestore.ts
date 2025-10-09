// lib/firebase/firestore.ts
// Firestore database operations for invoices and agreements

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc,
  limit,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import {
  Invoice,
  Agreement,
  Template,
  InvoiceStatus,
  InvoiceStats,
} from "../types";

// ==================== INVOICE OPERATIONS ====================

/**
 * Create a new invoice
 */
export const createInvoice = async (
  invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const invoicesRef = collection(db, "invoices");
    const docRef = await addDoc(invoicesRef, {
      ...invoice,
      dueDate: Timestamp.fromDate(invoice.dueDate),
      issueDate: Timestamp.fromDate(invoice.issueDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    throw new Error(error.message || "Failed to create invoice");
  }
};

/**
 * Get all invoices for a specific user
 */
export const getUserInvoices = async (userId: string): Promise<Invoice[]> => {
  try {
    const invoicesRef = collection(db, "invoices");
    const q = query(
      invoicesRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || new Date(),
        issueDate: data.issueDate?.toDate() || new Date(),
      } as Invoice;
    });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    throw new Error(error.message || "Failed to fetch invoices");
  }
};

/**
 * Get invoices filtered by status
 */
export const getInvoicesByStatus = async (
  userId: string,
  status: InvoiceStatus
): Promise<Invoice[]> => {
  try {
    const invoicesRef = collection(db, "invoices");
    const q = query(
      invoicesRef,
      where("userId", "==", userId),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || new Date(),
        issueDate: data.issueDate?.toDate() || new Date(),
      } as Invoice;
    });
  } catch (error: any) {
    console.error("Error fetching invoices by status:", error);
    throw new Error(error.message || "Failed to fetch invoices");
  }
};

/**
 * Get a single invoice by ID
 */
export const getInvoice = async (
  invoiceId: string
): Promise<Invoice | null> => {
  try {
    const docRef = doc(db, "invoices", invoiceId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate() || new Date(),
        issueDate: data.issueDate?.toDate() || new Date(),
      } as Invoice;
    }

    return null;
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    throw new Error(error.message || "Failed to fetch invoice");
  }
};

/**
 * Update an existing invoice
 */
export const updateInvoice = async (
  invoiceId: string,
  updates: Partial<Invoice>
): Promise<void> => {
  try {
    const docRef = doc(db, "invoices", invoiceId);

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert dates to Timestamps if they exist
    if (updates.dueDate) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }
    if (updates.issueDate) {
      updateData.issueDate = Timestamp.fromDate(updates.issueDate);
    }

    await updateDoc(docRef, updateData);
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    throw new Error(error.message || "Failed to update invoice");
  }
};

/**
 * Update invoice status
 */
export const updateInvoiceStatus = async (
  invoiceId: string,
  status: InvoiceStatus
): Promise<void> => {
  try {
    const docRef = doc(db, "invoices", invoiceId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error("Error updating invoice status:", error);
    throw new Error(error.message || "Failed to update invoice status");
  }
};

/**
 * Delete an invoice
 */
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "invoices", invoiceId));
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    throw new Error(error.message || "Failed to delete invoice");
  }
};

/**
 * Get invoice statistics for a user
 */
export const getInvoiceStats = async (
  userId: string
): Promise<InvoiceStats> => {
  try {
    const invoices = await getUserInvoices(userId);

    const stats: InvoiceStats = {
      totalInvoices: invoices.length,
      paidInvoices: 0,
      unpaidInvoices: 0,
      overdueInvoices: 0,
      totalRevenue: 0,
      outstandingAmount: 0,
    };

    const today = new Date();

    invoices.forEach((invoice) => {
      if (invoice.status === "paid") {
        stats.paidInvoices++;
        stats.totalRevenue += invoice.total;
      } else {
        stats.unpaidInvoices++;
        stats.outstandingAmount += invoice.total;

        if (invoice.dueDate < today && invoice.status !== "paid") {
          stats.overdueInvoices++;
        }
      }
    });

    return stats;
  } catch (error: any) {
    console.error("Error calculating invoice stats:", error);
    throw new Error(error.message || "Failed to calculate stats");
  }
};

// ==================== AGREEMENT OPERATIONS ====================

/**
 * Create a new agreement
 */
export const createAgreement = async (
  agreement: Omit<Agreement, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const agreementsRef = collection(db, "agreements");
    const docRef = await addDoc(agreementsRef, {
      ...agreement,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error: any) {
    console.error("Error creating agreement:", error);
    throw new Error(error.message || "Failed to create agreement");
  }
};

/**
 * Get agreement by invoice ID
 */
export const getAgreementByInvoiceId = async (
  invoiceId: string
): Promise<Agreement | null> => {
  try {
    const agreementsRef = collection(db, "agreements");
    const q = query(agreementsRef, where("invoiceId", "==", invoiceId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Agreement;
    }

    return null;
  } catch (error: any) {
    console.error("Error fetching agreement:", error);
    throw new Error(error.message || "Failed to fetch agreement");
  }
};

/**
 * Get agreement by ID
 */
export const getAgreement = async (
  agreementId: string
): Promise<Agreement | null> => {
  try {
    const docRef = doc(db, "agreements", agreementId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Agreement;
    }

    return null;
  } catch (error: any) {
    console.error("Error fetching agreement:", error);
    throw new Error(error.message || "Failed to fetch agreement");
  }
};

/**
 * Update an agreement
 */
export const updateAgreement = async (
  agreementId: string,
  content: string,
  isFinalized?: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, "agreements", agreementId);
    const updateData: any = {
      content,
      updatedAt: Timestamp.now(),
    };

    if (isFinalized !== undefined) {
      updateData.isFinalized = isFinalized;
    }

    await updateDoc(docRef, updateData);
  } catch (error: any) {
    console.error("Error updating agreement:", error);
    throw new Error(error.message || "Failed to update agreement");
  }
};

/**
 * Delete an agreement
 */
export const deleteAgreement = async (agreementId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "agreements", agreementId));
  } catch (error: any) {
    console.error("Error deleting agreement:", error);
    throw new Error(error.message || "Failed to delete agreement");
  }
};

// ==================== TEMPLATE OPERATIONS ====================

/**
 * Get user templates
 */
export const getUserTemplates = async (
  userId: string,
  type?: "invoice" | "agreement"
): Promise<Template[]> => {
  try {
    const templatesRef = collection(db, "templates");
    const constraints: QueryConstraint[] = [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ];

    if (type) {
      constraints.splice(1, 0, where("type", "==", type));
    }

    const q = query(templatesRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Template;
    });
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    throw new Error(error.message || "Failed to fetch templates");
  }
};

/**
 * Create a new template
 */
export const createTemplate = async (
  template: Omit<Template, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const templatesRef = collection(db, "templates");
    const docRef = await addDoc(templatesRef, {
      ...template,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error: any) {
    console.error("Error creating template:", error);
    throw new Error(error.message || "Failed to create template");
  }
};

/**
 * Update a template
 */
export const updateTemplate = async (
  templateId: string,
  updates: Partial<Template>
): Promise<void> => {
  try {
    const docRef = doc(db, "templates", templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error("Error updating template:", error);
    throw new Error(error.message || "Failed to update template");
  }
};

/**
 * Delete a template
 */
export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "templates", templateId));
  } catch (error: any) {
    console.error("Error deleting template:", error);
    throw new Error(error.message || "Failed to delete template");
  }
};
