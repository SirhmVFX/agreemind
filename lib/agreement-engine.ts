import type { AgreementBrief } from "./types";

function clause(title: string, body: string) {
  return `${title}\n${body.trim()}`;
}

function moneyLine(brief: AgreementBrief) {
  return `${brief.totalFee || "the agreed fee"} ${brief.currency}`;
}

export function generateAgreement(brief: AgreementBrief, parties: { creator: string; business: string; client: string; company?: string }) {
  const client = brief && parties.client
    ? parties.company
      ? `${parties.client} (${parties.company})`
      : parties.client
    : "the Client";
  const creator = parties.business || parties.creator || "the Creator";
  const field = (brief.field || "creative work").toLowerCase();
  const project = brief.projectType || "the project";
  const deliverables = brief.deliverables || "the deliverables described in the attached invoice";
  const start = brief.startDate || "the start date";
  const deadline = brief.deadline || "the agreed deadline";
  const payment = brief.paymentMode || "as stated on the invoice";
  const revisions = brief.revisions || "two rounds of reasonable revisions";
  const ip = brief.ipOwnership || "Client owns final deliverables after full payment";
  const usage = brief.usageRights || "unlimited digital use for the named client brand";
  const kill = brief.killFee || "50% of the remaining fee if cancelled after work has begun";
  const late = brief.lateFee || "5% of the outstanding balance after 7 days past due";
  const jurisdiction = brief.jurisdiction || "the Federal Republic of Nigeria";
  const extras = brief.extras?.trim();

  const fieldSpecific = fieldSpecificClause(field, project);

  const sections = [
    clause(
      "1. Parties",
      `${creator} (“Creator”) and ${client} (“Client”) enter this agreement for ${project}. This document, together with any attached invoice, is the complete understanding between the parties unless both sign a written change.`,
    ),
    clause(
      "2. Scope of work",
      `Creator will provide ${field} services for ${project}. Deliverables: ${deliverables}. Work begins on ${start} and is due on ${deadline}, unless the parties agree in writing to a new date. Out-of-scope requests are billed separately at Creator’s then-current rate.`,
    ),
    fieldSpecific,
    clause(
      "3. Timeline and client duties",
      `Client will supply briefs, assets, access, and feedback within a reasonable time. Delays caused by missing materials, delayed approvals, or additional stakeholders extend the deadline by the same number of days. Creator is not liable for launch dates that slip because Client review was late.`,
    ),
    clause(
      "4. Fees and payment",
      `The fee for this work is ${moneyLine(brief)}. Payment is ${payment}. Invoices are due as dated. A deposit, if shown on the invoice, is due before work starts and is non-refundable once production has begun. Late balances attract ${late}. Creator may pause work, withhold files, and keep usage rights until the invoice is paid in full.`,
    ),
    clause(
      "5. Revisions",
      `The fee includes ${revisions}. Further revisions, new directions after approval, or additional versions are extra and quoted before they start. Silence for five business days after a delivery counts as approval of that stage.`,
    ),
    clause(
      "6. Intellectual property",
      `${ip}. Until full payment, all work product remains Creator’s property. After payment, Client receives the usage described here: ${usage}. Creator retains the right to show the work in a portfolio, case study, and self-promotion unless Client requests written confidentiality covering the project.`,
    ),
    clause(
      "7. Cancellation",
      `Either party may cancel in writing. If Client cancels after work has started, Client pays ${kill}, plus expenses already incurred. Work completed to the cancellation date is delivered in its then-current form. Deposits are credited against that amount.`,
    ),
    clause(
      "8. Confidentiality and publicity",
      brief.confidentiality
        ? `Both parties will keep non-public information about the project confidential for two years, except as required by law or to collect payment. Creator will not publish the work until Client’s public launch, or 30 days after delivery, whichever is earlier.`
        : `Creator may credit the work and Client’s name in a portfolio after the project is public. Client may not represent the work as produced in-house.`,
    ),
    clause(
      "9. Independent contractor",
      `Creator is an independent contractor, not an employee. Creator chooses tools, hours, and methods, and may use trusted collaborators under the same confidentiality terms. Nothing in this agreement creates a partnership or employment relationship.`,
    ),
    clause(
      "10. Limitation of liability",
      `Creator’s total liability under this agreement is limited to the fees actually paid for the project. Creator is not liable for indirect, incidental, or lost-profit damages, or for how Client uses the work after delivery.`,
    ),
    extras
      ? clause("11. Additional terms", extras)
      : clause(
          "11. Additional terms",
          "No other promises apply unless written here or on the attached invoice.",
        ),
    clause(
      extras ? "12. Governing law" : "12. Governing law",
      `This agreement is governed by the laws of ${jurisdiction}. If a clause is unenforceable, the rest remains in force. The parties will try to resolve disputes in good faith before litigation.`,
    ),
    clause(
      extras ? "13. Signatures" : "13. Signatures",
      `By signing or accepting this agreement (including electronically), each party confirms they have authority to bind the named business and have read the terms.`,
    ),
  ];

  return sections.join("\n\n");
}

function fieldSpecificClause(field: string, project: string) {
  if (field.includes("video") || field.includes("photo") || field.includes("film") || field.includes("motion")) {
    return clause(
      "2A. Production notes",
      `Shoot or production days are as scheduled for ${project}. Weather, location access, talent, and permits are Client’s responsibility unless quoted otherwise. Raw footage and session files are not included unless listed as a deliverable. Usage is for the named campaign or brand unless a broader license is purchased.`,
    );
  }
  if (field.includes("software") || field.includes("backend") || field.includes("frontend") || field.includes("engineer")) {
    return clause(
      "2A. Engineering notes",
      `Source code is delivered to a repository Client controls after payment. Third-party services, licenses, hosting, and app-store fees are Client’s cost. Creator does not provide ongoing maintenance unless a separate retainer is agreed. Acceptance is based on the written scope, not on later product ideas.`,
    );
  }
  if (field.includes("product") || field.includes("ux") || field.includes("design")) {
    return clause(
      "2A. Design notes",
      `Work is delivered in the formats listed in the scope (typically Figma or exported assets). Design systems, unused concepts, and exploratory files remain Creator’s unless purchased. Client is responsible for final copy, legal claims, and brand approvals.`,
    );
  }
  if (field.includes("content") || field.includes("social") || field.includes("copy")) {
    return clause(
      "2A. Content notes",
      `Posting, boosting, and community management are not included unless listed. Client must provide product access, talking points, and disclosure requirements. Creator is not responsible for platform algorithm changes or paid-media performance.`,
    );
  }
  return clause(
    "2A. Professional standard",
    `Creator will perform the work with the care expected of an independent professional in this field. Client’s internal taste notes after a stage is approved do not reopen that stage without a change order.`,
  );
}

export const WIZARD_STEPS = [
  {
    id: "work",
    title: "The work",
    copy: "What kind of creative are you, and what is this project actually called?",
  },
  {
    id: "scope",
    title: "Scope",
    copy: "Deliverables and dates. Be specific — the agreement will quote this back.",
  },
  {
    id: "money",
    title: "Money",
    copy: "How you get paid, and what happens if the invoice sits.",
  },
  {
    id: "rights",
    title: "Rights",
    copy: "Who owns the work, how it can be used, and what a kill fee looks like.",
  },
  {
    id: "legal",
    title: "Legal extras",
    copy: "Jurisdiction, confidentiality, anything this project is picky about.",
  },
] as const;
