export type Currency = "NGN" | "USD" | "GBP" | "EUR" | "CAD";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "partial"
  | "paid"
  | "overdue"
  | "void";

export type AgreementStatus = "draft" | "sent" | "signed" | "declined";

export type FontFamily = "serif" | "sans";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type InvoiceStyle = {
  templateId: string;
  accent: string;
  logoDataUrl?: string;
  showLogo: boolean;
  font: FontFamily;
  footer: string;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  ownerId?: string;
};

export type Profile = {
  name: string;
  business: string;
  role: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  website: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  defaultCurrency: Currency;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
};

export type AgreementBrief = {
  field: string;
  projectType: string;
  deliverables: string;
  startDate: string;
  deadline: string;
  paymentMode: string;
  totalFee: string;
  currency: Currency;
  revisions: string;
  ipOwnership: string;
  usageRights: string;
  killFee: string;
  confidentiality: boolean;
  lateFee: string;
  jurisdiction: string;
  extras: string;
};

export type Agreement = {
  id: string;
  title: string;
  clientId: string;
  invoiceId?: string;
  status: AgreementStatus;
  brief: AgreementBrief;
  body: string;
  createdAt: string;
  signedAt?: string;
  signerName?: string;
  ownerId?: string;
  clientSnapshot?: Client;
  profileSnapshot?: Profile;
};

export type Invoice = {
  id: string;
  number: string;
  status: InvoiceStatus;
  clientId: string;
  projectName: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  items: LineItem[];
  taxRate: number;
  discount: number;
  discountType: "percent" | "fixed";
  depositPercent: number;
  notes: string;
  paymentTerms: string;
  style: InvoiceStyle;
  agreementId?: string;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  pdfUrl?: string;
  clientSnapshot?: Client;
  profileSnapshot?: Profile;
  agreementSnapshot?: Agreement;
};

export type Session = {
  email: string;
  name: string;
  uid?: string;
  demo?: boolean;
};

export type StoreState = {
  profile: Profile;
  clients: Client[];
  invoices: Invoice[];
  agreements: Agreement[];
  ownedTemplateIds: string[];
  aiCredits: number;
};
