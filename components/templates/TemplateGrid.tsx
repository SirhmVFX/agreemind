"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayModal } from "@/components/ui/PayModal";
import { naira } from "@/lib/format";
import { useStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";

export function TemplateGrid({ studio = false }: { studio?: boolean }) {
  const { ownsTemplate, ownTemplate, session } = useStore();
  const router = useRouter();
  const [buying, setBuying] = useState<(typeof TEMPLATES)[number] | null>(null);

  return (
    <>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => {
          const owned = ownsTemplate(t.id) || !t.premium;
          return (
            <div key={t.id} className="overflow-hidden rounded-2xl border border-line">
              <div className="h-36 p-5" style={{ background: t.paper, color: t.ink }}>
                <div className="h-1 w-16" style={{ background: t.accent }} />
                <p className="mt-6 font-serif text-3xl">{t.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em]" style={{ color: t.muted }}>
                  {t.kind} · {t.field}
                </p>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted">{t.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm">{t.premium ? naira(t.price) : "Free"}</span>
                  {owned ? (
                    <span className="text-xs uppercase tracking-[0.16em] text-sage">
                      {studio ? "In studio" : "Included"}
                    </span>
                  ) : (
                    <button
                      className="btn btn-gold !px-3 !py-1.5 text-sm"
                      onClick={() => {
                        if (!session) {
                          router.push("/signup");
                          return;
                        }
                        setBuying(t);
                      }}
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <PayModal
        open={!!buying}
        title={buying?.name || ""}
        amount={buying?.price || 0}
        copy="One-time unlock. This layout is yours on every invoice and agreement after."
        onClose={() => setBuying(null)}
        onConfirm={() => {
          if (buying) ownTemplate(buying.id);
          setBuying(null);
          if (!studio) router.push("/studio/templates");
        }}
      />
    </>
  );
}
