import { addDaysISO, todayISO, uid } from "./format";
import { generateAgreement } from "./agreement-engine";
import { FREE_TEMPLATE_IDS } from "./templates";
import type { Client, Invoice, Profile, StoreState } from "./types";

const defaultProfile: Profile = {
  name: "Adaeze Okonkwo",
  business: "Northlight Studio",
  role: "Videographer & editor",
  email: "ada@northlight.studio",
  phone: "+234 810 000 4400",
  address: "12 Akin Adesola, Victoria Island, Lagos",
  taxId: "TIN-20844109",
  website: "northlight.studio",
  bankName: "GTBank",
  accountName: "Northlight Studio",
  accountNumber: "0123456789",
  defaultCurrency: "NGN",
  defaultTaxRate: 7.5,
  defaultPaymentTerms: "50% to start, balance on delivery. Due in 7 days.",
};

function client(
  partial: Omit<Client, "createdAt"> & { createdAt?: string },
): Client {
  return { createdAt: todayISO(), ...partial };
}

export function seedState(): StoreState {
  const clients: Client[] = [
    client({
      id: "cl_lumen",
      name: "Tomiwa Adeyemi",
      company: "Lumen Retail",
      email: "tomiwa@lumen.ng",
      phone: "+234 809 111 2000",
      address: "Ikeja, Lagos",
      notes: "Q3 campaign. Prefers invoices on Fridays.",
    }),
    client({
      id: "cl_arc",
      name: "Hannah Cole",
      company: "Arc Health",
      email: "hannah@archealth.co",
      phone: "+1 415 555 0199",
      address: "San Francisco, CA",
      notes: "USD invoices. Net 14.",
    }),
    client({
      id: "cl_kola",
      name: "Kola Bello",
      company: "",
      email: "kola@hello.com",
      phone: "+234 703 222 1188",
      address: "Abuja",
      notes: "Personal brand. Fast payer.",
    }),
  ];

  const invoices: Invoice[] = [
    {
      id: "inv_seed_1",
      number: "INV-2026-0001",
      status: "sent",
      clientId: "cl_lumen",
      projectName: "Lumen autumn lookbook — film + stills",
      issueDate: todayISO(),
      dueDate: addDaysISO(7),
      currency: "NGN",
      items: [
        {
          id: uid("li"),
          description: "2-day studio shoot, lighting & direction",
          quantity: 2,
          rate: 180000,
        },
        {
          id: uid("li"),
          description: "Edit: 45s hero film + 9 stills",
          quantity: 1,
          rate: 220000,
        },
        {
          id: uid("li"),
          description: "Usage: digital + paid social, 12 months",
          quantity: 1,
          rate: 80000,
        },
      ],
      taxRate: 7.5,
      discount: 0,
      discountType: "percent",
      depositPercent: 50,
      notes: "Call sheet and shot list attached in Drive. Colour grade in Rec.709.",
      paymentTerms: "50% to start, balance on delivery. Due in 7 days.",
      style: {
        templateId: "frame",
        accent: "#8a3b22",
        showLogo: true,
        font: "serif",
        footer: "Thank you for trusting Northlight with the work.",
      },
      paidAmount: 258750,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "inv_seed_2",
      number: "INV-2026-0002",
      status: "paid",
      clientId: "cl_arc",
      projectName: "Arc Health — onboarding product films",
      issueDate: addDaysISO(-18),
      dueDate: addDaysISO(-4),
      currency: "USD",
      items: [
        {
          id: uid("li"),
          description: "Product film, 60 seconds",
          quantity: 1,
          rate: 4200,
        },
        {
          id: uid("li"),
          description: "Cutdowns for paid social (3)",
          quantity: 3,
          rate: 350,
        },
      ],
      taxRate: 0,
      discount: 5,
      discountType: "percent",
      depositPercent: 0,
      notes: "Files delivered via Frame.io.",
      paymentTerms: "Net 14",
      style: {
        templateId: "commit",
        accent: "#1c3a4a",
        showLogo: true,
        font: "sans",
        footer: "Northlight Studio · northlight.studio",
      },
      paidAmount: 4987.5,
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: "inv_seed_3",
      number: "INV-2026-0003",
      status: "draft",
      clientId: "cl_kola",
      projectName: "Personal brand — 8 talking-head films",
      issueDate: todayISO(),
      dueDate: addDaysISO(14),
      currency: "NGN",
      items: [
        {
          id: uid("li"),
          description: "Half-day shoot, one location",
          quantity: 1,
          rate: 95000,
        },
        {
          id: uid("li"),
          description: "Edit, captions, 9:16 export",
          quantity: 8,
          rate: 18000,
        },
      ],
      taxRate: 0,
      discount: 10000,
      discountType: "fixed",
      depositPercent: 40,
      notes: "",
      paymentTerms: "40% deposit, balance before file handoff.",
      style: {
        templateId: "atelier",
        accent: "#1f3d2b",
        showLogo: true,
        font: "serif",
        footer: "Questions? Reply to this invoice.",
      },
      paidAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const brief = {
    field: "Videographer",
    projectType: "Autumn lookbook film and stills for Lumen Retail",
    deliverables:
      "One 45-second hero film, nine retouched stills, paid-social usage for 12 months.",
    startDate: todayISO(),
    deadline: addDaysISO(21),
    paymentMode: "50% deposit, 50% on delivery",
    totalFee: "480,000",
    currency: "NGN" as const,
    revisions: "two rounds of picture lock / still selects",
    ipOwnership: "Client owns finals after full payment; raw files stay with Creator unless purchased",
    usageRights: "Web, social, and paid ads for Lumen Retail, 12 months, Nigeria",
    killFee: "50% of remaining fee plus expenses",
    confidentiality: false,
    lateFee: "5% after 7 days overdue",
    jurisdiction: "Lagos State, Nigeria",
    extras: "Wardrobe and talent booked by Client. Studio hire included in the fee.",
  };

  return {
    profile: defaultProfile,
    clients,
    invoices,
    agreements: [
      {
        id: "ag_seed_1",
        title: "Lumen autumn lookbook agreement",
        clientId: "cl_lumen",
        invoiceId: "inv_seed_1",
        status: "sent",
        brief,
        body: generateAgreement(brief, {
          creator: defaultProfile.name,
          business: defaultProfile.business,
          client: "Tomiwa Adeyemi",
          company: "Lumen Retail",
        }),
        createdAt: new Date().toISOString(),
      },
    ],
    ownedTemplateIds: ["atelier", "frame", "commit"],
    aiCredits: 1,
  };
}

export const emptyProfile = (): Profile => ({
  name: "",
  business: "",
  role: "",
  email: "",
  phone: "",
  address: "",
  taxId: "",
  website: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  defaultCurrency: "NGN",
  defaultTaxRate: 0,
  defaultPaymentTerms: "Due on receipt",
});

export function emptyState(): StoreState {
  return {
    profile: emptyProfile(),
    clients: [],
    invoices: [],
    agreements: [],
    ownedTemplateIds: [...FREE_TEMPLATE_IDS],
    aiCredits: 0,
  };
}
