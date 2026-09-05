"use client";

import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { naira } from "@/lib/format";
import { PREMIUM_TEMPLATE_FROM } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export default function StudioTemplatesPage() {
  const { state } = useStore();

  return (
    <div>
      <h1 className="font-serif text-4xl">Templates</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Premium invoice and agreement covers from {naira(PREMIUM_TEMPLATE_FROM)}.
        You own {state.ownedTemplateIds.length} layout
        {state.ownedTemplateIds.length === 1 ? "" : "s"}.
      </p>
      <TemplateGrid studio />
    </div>
  );
}
