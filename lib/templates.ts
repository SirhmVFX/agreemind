export type TemplateKind = "invoice" | "agreement";

export type InvoiceTemplate = {
  id: string;
  name: string;
  kind: TemplateKind;
  premium: boolean;
  price: number;
  accent: string;
  paper: string;
  ink: string;
  muted: string;
  layout: "classic" | "editorial" | "studio" | "minimal" | "bold" | "ledger";
  blurb: string;
  field: string;
};

export const TEMPLATES: InvoiceTemplate[] = [
  {
    id: "atelier",
    name: "Atelier",
    kind: "invoice",
    premium: false,
    price: 0,
    accent: "#1f3d2b",
    paper: "#f6f1e8",
    ink: "#171411",
    muted: "#7a7468",
    layout: "classic",
    blurb: "Quiet studio invoice. Serif heading, generous paper, nothing shouting.",
    field: "Any creative",
  },
  {
    id: "frame",
    name: "Frame",
    kind: "invoice",
    premium: false,
    price: 0,
    accent: "#8a3b22",
    paper: "#f3eee4",
    ink: "#1a1612",
    muted: "#7c766b",
    layout: "editorial",
    blurb: "For photographers and videographers. Caption-like metadata, film still energy.",
    field: "Photo / film",
  },
  {
    id: "commit",
    name: "Commit",
    kind: "invoice",
    premium: false,
    price: 0,
    accent: "#1c3a4a",
    paper: "#f4f0e8",
    ink: "#121417",
    muted: "#6e7378",
    layout: "minimal",
    blurb: "Engineers and product people. Tight type, numbered lines, no decoration.",
    field: "Software",
  },
  {
    id: "lookbook",
    name: "Lookbook",
    kind: "invoice",
    premium: true,
    price: 999,
    accent: "#5c2e3a",
    paper: "#f7f0e6",
    ink: "#1b1214",
    muted: "#8a7a76",
    layout: "editorial",
    blurb: "Fashion and brand design. Oversized number, thin rules, magazine footer.",
    field: "Brand / fashion",
  },
  {
    id: "soundstage",
    name: "Soundstage",
    kind: "invoice",
    premium: true,
    price: 1850,
    accent: "#c4a06a",
    paper: "#11110f",
    ink: "#f3eee4",
    muted: "#9a9488",
    layout: "studio",
    blurb: "Dark paper for motion and music. Gold rules. Feels like a credit slate.",
    field: "Motion / music",
  },
  {
    id: "spec",
    name: "Spec",
    kind: "invoice",
    premium: true,
    price: 1650,
    accent: "#2f5c4a",
    paper: "#eef1ec",
    ink: "#14201a",
    muted: "#66736c",
    layout: "ledger",
    blurb: "Product design and research. Grid, labels, a working document not a flyer.",
    field: "Product / UX",
  },
  {
    id: "billboard",
    name: "Billboard",
    kind: "invoice",
    premium: true,
    price: 1950,
    accent: "#d4552a",
    paper: "#f8f3ea",
    ink: "#16120e",
    muted: "#7d766c",
    layout: "bold",
    blurb: "Creators who want the invoice to look like the work. Big type, loud accent.",
    field: "Content / social",
  },
  {
    id: "covenant",
    name: "Covenant",
    kind: "agreement",
    premium: true,
    price: 999,
    accent: "#2a3328",
    paper: "#f5f0e7",
    ink: "#161411",
    muted: "#7a7468",
    layout: "classic",
    blurb: "Matching agreement cover. Same paper as Atelier, legal-document rhythm.",
    field: "Agreements",
  },
  {
    id: "rider",
    name: "Rider",
    kind: "agreement",
    premium: true,
    price: 1750,
    accent: "#c4a06a",
    paper: "#11110f",
    ink: "#f3eee4",
    muted: "#9a9488",
    layout: "studio",
    blurb: "Dark agreement cover for production and touring-style deals.",
    field: "Agreements",
  },
];

export const FREE_TEMPLATE_IDS = TEMPLATES.filter((t) => !t.premium).map((t) => t.id);

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
