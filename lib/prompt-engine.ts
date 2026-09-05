import { generateAgreement } from "./agreement-engine";
import { addDaysISO, todayISO, uid } from "./format";
import type {
  Agreement,
  AgreementBrief,
  Client,
  Currency,
  Invoice,
  LineItem,
  Profile,
} from "./types";

export type ExtractedBrief = {
  clientName: string;
  company: string;
  email: string;
  projectName: string;
  deliverables: string;
  startDate: string;
  deadline: string;
  paymentMode: string;
  totalFee: string;
  currency: Currency;
  field: string;
  notes: string;
  lineHints: { description: string; rate: number }[];
};

export type PromptAnswers = ExtractedBrief & {
  includeAgreement: boolean;
  taxRate: number;
  depositPercent: number;
  revisions: string;
  ipOwnership: string;
  usageRights: string;
  killFee: string;
  jurisdiction: string;
  confidentiality: boolean;
};

const CURRENCY_WORDS: Record<string, Currency> = {
  naira: "NGN",
  ngn: "NGN",
  "₦": "NGN",
  dollar: "USD",
  dollars: "USD",
  usd: "USD",
  $: "USD",
  pound: "GBP",
  gbp: "GBP",
  "£": "GBP",
  euro: "EUR",
  eur: "EUR",
  "€": "EUR",
  cad: "CAD",
};

const FIELD_HINTS: [RegExp, string][] = [
  [/video|film|cinemat|shoot|editor/i, "Videographer"],
  [/photo|lookbook|still/i, "Photographer"],
  [/product design|figma|ux|ui/i, "Product designer"],
  [/backend|api|server/i, "Backend developer"],
  [/frontend|react|next\.js/i, "Frontend developer"],
  [/software|engineer|developer/i, "Software engineer"],
  [/motion|after effects|animation/i, "Motion designer"],
  [/brand|identity|logo/i, "Brand designer"],
  [/copy|script|words/i, "Copywriter"],
  [/music|audio|sound/i, "Music producer"],
  [/content|social|tiktok|instagram/i, "Content creator"],
];

function capture(text: string, re: RegExp) {
  const m = text.match(re);
  return m?.[1]?.trim() || "";
}

function parseMoney(raw: string) {
  const cleaned = raw.replace(/[₦$£€,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseDateLoose(raw: string) {
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return "";
}

export function emptyExtracted(currency: Currency): ExtractedBrief {
  return {
    clientName: "",
    company: "",
    email: "",
    projectName: "",
    deliverables: "",
    startDate: todayISO(),
    deadline: addDaysISO(14),
    paymentMode: "50% deposit, balance on delivery",
    totalFee: "",
    currency,
    field: "",
    notes: "",
    lineHints: [],
  };
}

export function extractFromDocument(text: string, currency: Currency): ExtractedBrief {
  const extracted = emptyExtracted(currency);
  if (!text.trim()) return extracted;

  extracted.clientName =
    capture(text, /(?:client|billed to|for)\s*[:\-]\s*([A-Za-z][A-Za-z .'-]{2,60})/i) ||
    capture(text, /(?:dear|hi|hello)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
  extracted.company =
    capture(text, /(?:company|brand|studio|agency)\s*[:\-]\s*(.+)/i);
  extracted.email = capture(text, /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  extracted.projectName =
    capture(text, /(?:project|campaign|job|title)\s*[:\-]\s*(.+)/i) ||
    capture(text, /re:\s*(.+)/i);
  extracted.deliverables =
    capture(
      text,
      /(?:deliverables?|scope|includes?)\s*[:\-]\s*([\s\S]{10,800}?)(?:\n\n|deadline|due|payment|fee|total|$)/i,
    );
  extracted.deadline =
    parseDateLoose(capture(text, /(?:deadline|due(?: date)?|delivery)\s*[:\-]\s*([A-Za-z0-9 ,/-]{6,40})/i)) ||
    extracted.deadline;
  extracted.startDate =
    parseDateLoose(capture(text, /(?:start|begins?|kick[- ]?off)\s*[:\-]\s*([A-Za-z0-9 ,/-]{6,40})/i)) ||
    extracted.startDate;
  extracted.paymentMode =
    capture(text, /(?:payment|terms)\s*[:\-]\s*(.+)/i) || extracted.paymentMode;

  const fee =
    capture(text, /(?:total|fee|budget|price|cost)\s*[:\-]\s*([₦$£€]?\s*[\d,.]+)/i) ||
    capture(text, /([₦$£€]\s*[\d,]{3,})/);
  if (fee) extracted.totalFee = String(parseMoney(fee) || fee.replace(/[^\d.]/g, ""));

  for (const [word, code] of Object.entries(CURRENCY_WORDS)) {
    if (text.toLowerCase().includes(word) || text.includes(word)) {
      extracted.currency = code;
      break;
    }
  }

  for (const [re, field] of FIELD_HINTS) {
    if (re.test(text)) {
      extracted.field = field;
      break;
    }
  }

  const lineRe = /(?:^|\n)\s*[-*•]?\s*(.+?)\s[-–—]\s*([₦$£€]?\s*[\d,]+)/g;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(text))) {
    extracted.lineHints.push({
      description: m[1].trim(),
      rate: parseMoney(m[2]),
    });
  }

  extracted.notes = text.trim().slice(0, 1200);
  if (!extracted.projectName) {
    const first = text.trim().split("\n").find((l) => l.trim().length > 8);
    extracted.projectName = (first || "Untitled project").slice(0, 80);
  }
  return extracted;
}

export function defaultAnswers(extracted: ExtractedBrief, profile: Profile): PromptAnswers {
  return {
    ...extracted,
    includeAgreement: false,
    taxRate: profile.defaultTaxRate,
    depositPercent: 50,
    revisions: "two rounds of reasonable revisions",
    ipOwnership: "Client owns final deliverables after full payment",
    usageRights: "unlimited digital use for the named client brand",
    killFee: "50% of the remaining fee if cancelled after work has begun",
    jurisdiction: "the Federal Republic of Nigeria",
    confidentiality: false,
    field: extracted.field || profile.role || "Other",
    currency: extracted.currency || profile.defaultCurrency,
    paymentMode: extracted.paymentMode || profile.defaultPaymentTerms,
  };
}

export function buildLineItems(answers: PromptAnswers): LineItem[] {
  if (answers.lineHints.length) {
    return answers.lineHints.map((h) => ({
      id: uid("li"),
      description: h.description,
      quantity: 1,
      rate: h.rate,
    }));
  }
  const rate = parseMoney(answers.totalFee);
  const deliverables = answers.deliverables
    .split(/[\n;•]+/)
    .map((s) => s.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 6);
  if (deliverables.length > 1 && rate) {
    const each = Math.round(rate / deliverables.length);
    return deliverables.map((d) => ({
      id: uid("li"),
      description: d,
      quantity: 1,
      rate: each,
    }));
  }
  return [
    {
      id: uid("li"),
      description:
        answers.deliverables || answers.projectName || "Creative services",
      quantity: 1,
      rate,
    },
  ];
}

export function buildInvoiceFromPrompt(opts: {
  answers: PromptAnswers;
  client: Client;
  profile: Profile;
  number: string;
  ownerId?: string;
}): Invoice {
  const { answers, client, profile, number, ownerId } = opts;
  return {
    id: uid("inv"),
    number,
    status: "draft",
    clientId: client.id,
    projectName: answers.projectName || "Untitled project",
    issueDate: answers.startDate || todayISO(),
    dueDate: answers.deadline || addDaysISO(7),
    currency: answers.currency,
    items: buildLineItems(answers),
    taxRate: answers.taxRate,
    discount: 0,
    discountType: "percent",
    depositPercent: answers.depositPercent,
    notes: answers.notes.slice(0, 500),
    paymentTerms: answers.paymentMode,
    style: {
      templateId: "atelier",
      accent: "#1f3d2b",
      showLogo: true,
      font: "serif",
      footer: "Thank you for the work.",
    },
    paidAmount: 0,
    ownerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientSnapshot: client,
    profileSnapshot: profile,
  };
}

export function buildAgreementFromPrompt(opts: {
  answers: PromptAnswers;
  client: Client;
  profile: Profile;
  invoiceId: string;
  ownerId?: string;
}): Agreement {
  const { answers, client, profile, invoiceId, ownerId } = opts;
  const brief: AgreementBrief = {
    field: answers.field,
    projectType: answers.projectName,
    deliverables: answers.deliverables || answers.projectName,
    startDate: answers.startDate,
    deadline: answers.deadline,
    paymentMode: answers.paymentMode,
    totalFee: answers.totalFee || String(
      answers.lineHints.reduce((s, h) => s + h.rate, 0) || 0,
    ),
    currency: answers.currency,
    revisions: answers.revisions,
    ipOwnership: answers.ipOwnership,
    usageRights: answers.usageRights,
    killFee: answers.killFee,
    confidentiality: answers.confidentiality,
    lateFee: "5% of the outstanding balance after 7 days past due",
    jurisdiction: answers.jurisdiction,
    extras: answers.notes,
  };
  return {
    id: uid("ag"),
    title: `${answers.projectName || "Project"} agreement`,
    clientId: client.id,
    invoiceId,
    status: "draft",
    brief,
    body: generateAgreement(brief, {
      creator: profile.name,
      business: profile.business,
      client: client.name,
      company: client.company,
    }),
    createdAt: new Date().toISOString(),
    ownerId,
    clientSnapshot: client,
    profileSnapshot: profile,
  };
}

function n(raw: string) {
  const m = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

function quoted(raw: string) {
  const m = raw.match(/["“'](.+?)["”']/);
  return m?.[1]?.trim() || "";
}

export function applyChatEdit(
  message: string,
  invoice: Invoice,
  agreement?: Agreement,
): { invoice: Invoice; agreement?: Agreement; reply: string } {
  const text = message.trim();
  const lower = text.toLowerCase();
  let inv = { ...invoice, items: invoice.items.map((i) => ({ ...i })), updatedAt: new Date().toISOString() };
  let ag = agreement ? { ...agreement } : undefined;
  const replies: string[] = [];

  const bump = (reply: string) => replies.push(reply);

  if (/include agreement|add agreement|generate agreement|attach agreement/.test(lower)) {
    bump("Turn on Include agreement from the brief screen, or open Generate agreement. Chat can edit an agreement once it exists.");
  }

  if (/remove (?:the )?(?:line|item|row)?\s*(.+)/i.test(text) || /^remove\s+(.+)/i.test(text)) {
    const target = (text.match(/remove\s+(?:the\s+)?(?:line|item|row)?\s*(.+)/i)?.[1] || "").toLowerCase();
    const before = inv.items.length;
    inv.items = inv.items.filter(
      (it) => !it.description.toLowerCase().includes(target.replace(/["']/g, "").trim()),
    );
    if (inv.items.length < before) bump(`Removed the line matching “${target.trim()}”.`);
  }

  if (/\badd\b/.test(lower) && !/agreement/.test(lower) && !/notes?/.test(lower)) {
    const rest = text.replace(/^.*?\badd(?: a)?(?: line| item)?\s*(?:for|of)?\s*/i, "");
    const amount = n(rest);
    const desc =
      quoted(rest) ||
      rest.replace(/[₦$£€]|[\d,]+/g, "").replace(/\bat\b|\bfor\b|\brate\b/gi, "").trim();
    if (desc) {
      inv.items = [
        ...inv.items,
        { id: uid("li"), description: desc, quantity: 1, rate: amount },
      ];
      bump(amount ? `Added “${desc}” at ${amount}.` : `Added “${desc}”. Set a rate if you want it billed.`);
    }
  }

  if (/\binclude\s+/.test(lower) && !/agreement/.test(lower)) {
    const rest = text.replace(/^.*?\binclude\s+/i, "");
    const amount = n(rest);
    const desc = quoted(rest) || rest.replace(/[₦$£€]|[\d,]+/g, "").trim();
    if (desc && !inv.items.some((i) => i.description.toLowerCase().includes(desc.toLowerCase()))) {
      inv.items = [
        ...inv.items,
        { id: uid("li"), description: desc, quantity: 1, rate: amount },
      ];
      bump(`Included “${desc}”${amount ? ` at ${amount}` : ""}.`);
    }
  }

  if (/qty|quantity/.test(lower)) {
    const amount = n(text);
    const target = quoted(text);
    if (amount && target) {
      inv.items = inv.items.map((it) =>
        it.description.toLowerCase().includes(target.toLowerCase())
          ? { ...it, quantity: amount }
          : it,
      );
      bump(`Set quantity on “${target}” to ${amount}.`);
    }
  }

  if (/tax/.test(lower)) {
    const amount = n(text);
    if (/remove|no tax|zero/.test(lower)) {
      inv.taxRate = 0;
      bump("Tax is off.");
    } else if (amount) {
      inv.taxRate = amount;
      bump(`Tax set to ${amount}%.`);
    }
  }

  if (/deposit/.test(lower)) {
    const amount = n(text);
    if (/remove|no deposit|zero/.test(lower)) {
      inv.depositPercent = 0;
      bump("Deposit removed.");
    } else if (amount) {
      inv.depositPercent = amount;
      bump(`Deposit set to ${amount}%.`);
    }
  }

  if (/discount/.test(lower)) {
    const amount = n(text);
    if (/remove|no discount/.test(lower)) {
      inv.discount = 0;
      bump("Discount cleared.");
    } else if (amount) {
      inv.discount = amount;
      inv.discountType = /%|percent/.test(lower) ? "percent" : "fixed";
      bump(`Discount set to ${amount}${inv.discountType === "percent" ? "%" : ""}.`);
    }
  }

  if (/due|deadline/.test(lower)) {
    const date = parseDateLoose(capture(text, /(\d{4}-\d{2}-\d{2}|\d{1,2} [A-Za-z]+ \d{4}|[A-Za-z]+ \d{1,2},? \d{4})/) || "");
    const days = n(text);
    if (date) {
      inv.dueDate = date;
      bump(`Due date is ${date}.`);
    } else if (/in \d+/.test(lower) && days) {
      inv.dueDate = addDaysISO(days);
      bump(`Due in ${days} days.`);
    }
  }

  if (/payment|50\/50|net \d+|due on receipt/.test(lower)) {
    const terms = text.replace(/^(please |can you |also )?(set |change |make )?(the )?payment( terms)? (to |as )?/i, "").trim();
    if (terms.length > 3) {
      inv.paymentTerms = terms;
      bump(`Payment terms updated.`);
    }
  }

  if (/note|notes/.test(lower) && /add|include|say/.test(lower)) {
    const note = quoted(text) || text.replace(/^.*?notes?\s*(to |:)?/i, "").trim();
    if (note) {
      inv.notes = [inv.notes, note].filter(Boolean).join(" ");
      bump("Note added on the invoice.");
    }
  }

  if (/rename|project is|call it|title/.test(lower)) {
    const name = quoted(text) || capture(text, /(?:rename|call it|title|project is)\s+(.+)/i);
    if (name) {
      inv.projectName = name;
      bump(`Project is now “${name}”.`);
    }
  }

  if (/rate|price|fee|cost|charge/.test(lower) && n(text)) {
    const amount = n(text);
    const target = quoted(text);
    if (target) {
      inv.items = inv.items.map((it) =>
        it.description.toLowerCase().includes(target.toLowerCase())
          ? { ...it, rate: amount }
          : it,
      );
      bump(`Rate on “${target}” is now ${amount}.`);
    } else if (inv.items.length === 1) {
      inv.items[0] = { ...inv.items[0], rate: amount };
      bump(`Fee set to ${amount}.`);
    }
  }

  if (ag) {
    if (/confidential/.test(lower)) {
      ag = {
        ...ag,
        brief: { ...ag.brief, confidentiality: !/remove|no /.test(lower) },
      };
      ag.body = generateAgreement(ag.brief, {
        creator: inv.profileSnapshot?.name || "",
        business: inv.profileSnapshot?.business || "",
        client: inv.clientSnapshot?.name || "Client",
        company: inv.clientSnapshot?.company,
      });
      bump(/remove|no /.test(lower) ? "Confidentiality clause removed." : "Confidentiality is in.");
    }
    if (/kill fee/.test(lower)) {
      const amount = quoted(text) || capture(text, /kill fee[:\s]+(.+)/i);
      if (amount) {
        ag = { ...ag, brief: { ...ag.brief, killFee: amount } };
        ag.body = generateAgreement(ag.brief, {
          creator: inv.profileSnapshot?.name || "",
          business: inv.profileSnapshot?.business || "",
          client: inv.clientSnapshot?.name || "Client",
          company: inv.clientSnapshot?.company,
        });
        bump("Kill fee updated.");
      }
    }
    if (/revision/.test(lower)) {
      const amount = quoted(text) || capture(text, /revisions?[:\s]+(.+)/i);
      if (amount) {
        ag = { ...ag, brief: { ...ag.brief, revisions: amount } };
        ag.body = generateAgreement(ag.brief, {
          creator: inv.profileSnapshot?.name || "",
          business: inv.profileSnapshot?.business || "",
          client: inv.clientSnapshot?.name || "Client",
          company: inv.clientSnapshot?.company,
        });
        bump("Revisions clause updated.");
      }
    }
    if ((/add|include|also/.test(lower)) && /clause|agreement|say that/.test(lower)) {
      const extra = quoted(text) || text.replace(/^.*?(?:clause|say that|agreement)\s*/i, "").trim();
      if (extra) {
        const extras = [ag.brief.extras, extra].filter(Boolean).join("\n");
        ag = { ...ag, brief: { ...ag.brief, extras } };
        ag.body = generateAgreement(ag.brief, {
          creator: inv.profileSnapshot?.name || "",
          business: inv.profileSnapshot?.business || "",
          client: inv.clientSnapshot?.name || "Client",
          company: inv.clientSnapshot?.company,
        });
        bump("Added that to the agreement.");
      }
    }
  }

  if (!replies.length) {
    bump(
      "I can add or remove lines, change rates, tax, deposit, due date, notes, and payment terms. If an agreement is attached, I can add clauses, confidentiality, kill fee, and revisions. Try: add “colour grade” at 80000",
    );
  }

  return { invoice: inv, agreement: ag, reply: replies.join(" ") };
}
