import { SiteFooter, SiteHeader } from "@/components/marketing/SiteChrome";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { naira } from "@/lib/format";
import { PREMIUM_TEMPLATE_FROM } from "@/lib/pricing";

export const metadata = { title: "Templates" };

export default function TemplatesMarketingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Paper</p>
        <h1 className="font-serif mt-3 max-w-3xl text-5xl md:text-6xl">
          Templates that look like a studio, not a spreadsheet.
        </h1>
        <p className="mt-5 max-w-xl text-muted">
          Three layouts are free. Premium invoice and agreement covers start at{" "}
          {naira(PREMIUM_TEMPLATE_FROM)}, paid once, yours on every job after.
        </p>
        <TemplateGrid />
      </main>
      <SiteFooter />
    </div>
  );
}
