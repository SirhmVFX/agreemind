"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { I } from "@/components/icons";
import { useStore } from "@/lib/store";

const nav = [
  { href: "/studio", label: "Overview", icon: I.home },
  { href: "/studio/prompt", label: "From a brief", icon: I.spark },
  { href: "/studio/invoices", label: "Invoices", icon: I.invoice },
  { href: "/studio/clients", label: "Clients", icon: I.people },
  { href: "/studio/agreements", label: "Agreements", icon: I.stamp },
  { href: "/studio/templates", label: "Templates", icon: I.layout },
  { href: "/studio/settings", label: "Settings", icon: I.settings },
];

export function StudioShell({ children }: { children: ReactNode }) {
  const { session, ready, state, signOut } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Opening studio…
      </div>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside
        className={`no-print flex flex-col border-line bg-bg2 md:border-r ${open ? "flex" : "hidden"} md:sticky md:top-0 md:flex md:h-screen`}
      >
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-2">
          {nav.map((item) => {
            const active =
              item.href === "/studio"
                ? pathname === "/studio"
                : item.href === "/studio/prompt"
                  ? pathname.startsWith("/studio/prompt")
                  : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${active ? "bg-bg text-fg" : "text-muted hover:text-fg"}`}
              >
                {item.icon({ size: 16 })}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-5 py-6 text-xs text-muted">
          <p>{state.profile.business || session.name}</p>
          <p className="mt-1">{state.aiCredits} AI credit{state.aiCredits === 1 ? "" : "s"}</p>
          <button
            className="mt-3 text-gold"
            onClick={() => {
              void signOut();
              router.push("/");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="no-print flex h-14 items-center justify-between border-b border-line px-4 md:hidden">
          <Logo />
          <button onClick={() => setOpen((v) => !v)}>{I.menu()}</button>
        </div>
        <div className="px-4 py-8 md:px-8">{children}</div>
      </div>
    </div>
  );
}
