import { prettyDate } from "@/lib/format";
import { getTemplate } from "@/lib/templates";
import type { Agreement, Client, Profile } from "@/lib/types";

export function AgreementPaper({
  agreement,
  client,
  profile,
  templateId,
}: {
  agreement: Agreement;
  client?: Client;
  profile: Profile;
  templateId?: string;
}) {
  const tpl = getTemplate(templateId || (agreement.brief.field.includes("video") ? "rider" : "covenant"));
  const dark = tpl.layout === "studio";

  return (
    <article
      className="print-sheet paper-shadow p-8 md:p-12"
      style={{
        background: tpl.paper,
        color: tpl.ink,
        fontFamily: 'var(--font-instrument), "Times New Roman", serif',
      }}
    >
      <p
        className="text-[11px] uppercase tracking-[0.24em]"
        style={{ color: tpl.accent }}
      >
        Project agreement
      </p>
      <h1 className="mt-3 max-w-xl text-4xl leading-[1.1] md:text-5xl">
        {agreement.title}
      </h1>
      <p className="mt-4 text-sm" style={{ color: tpl.muted }}>
        Between {profile.business || profile.name} and{" "}
        {client?.company || client?.name || "the Client"} · {prettyDate(agreement.createdAt)}
      </p>

      <div
        className="my-8 h-px"
        style={{ background: dark ? "rgba(255,255,255,0.12)" : "#ddd4c4" }}
      />

      <div className="space-y-7 text-[15px] leading-7 whitespace-pre-wrap">
        {agreement.body}
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <SignBlock
          role="Creator"
          name={profile.name}
          firm={profile.business}
          muted={tpl.muted}
          ink={tpl.ink}
        />
        <SignBlock
          role="Client"
          name={agreement.signerName || client?.name || ""}
          firm={client?.company || ""}
          signed={!!agreement.signedAt}
          date={agreement.signedAt}
          muted={tpl.muted}
          ink={tpl.ink}
        />
      </div>
    </article>
  );
}

function SignBlock({
  role,
  name,
  firm,
  signed,
  date,
  muted,
  ink,
}: {
  role: string;
  name: string;
  firm: string;
  signed?: boolean;
  date?: string;
  muted: string;
  ink: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: muted }}>
        {role}
      </p>
      <div
        className="mt-8 border-b pb-1 text-lg italic"
        style={{ borderColor: muted, color: ink }}
      >
        {name || " "}
      </div>
      <p className="mt-2 text-sm" style={{ color: muted }}>
        {firm}
        {signed && date ? ` · signed ${prettyDate(date)}` : ""}
      </p>
    </div>
  );
}
