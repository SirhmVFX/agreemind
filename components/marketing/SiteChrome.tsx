"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { I } from "@/components/icons";
import { useStore } from "@/lib/store";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "/templates", label: "Templates" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const { session } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-header no-print sticky top-0 z-40 border-b border-line/80 backdrop-blur-md ${scrolled ? "is-scrolled" : "bg-bg/70"}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <Link href="/studio" className="btn btn-gold">
              Open studio
            </Link>
          ) : (
            <>
              <Link href="/login" className="nav-link text-sm text-muted hover:text-fg">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-gold">
                Start free
              </Link>
            </>
          )}
        </div>
        <button
          className="md:hidden text-fg"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? I.x() : I.menu()}
        </button>
      </div>
      {open && (
        <div className="border-t border-line px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href={session ? "/studio" : "/signup"} className="btn btn-gold mt-2">
              {session ? "Open studio" : "Start free"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Invoices and agreements for people who make things — not for
            accounting departments.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm text-muted">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-fg">
              Product
            </span>
            <Link href="/pricing" className="transition-colors hover:text-fg">
              Pricing
            </Link>
            <Link href="/templates" className="transition-colors hover:text-fg">
              Templates
            </Link>
            <Link href="/faq" className="transition-colors hover:text-fg">
              FAQ
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-fg">
              Studio
            </span>
            <Link href="/signup" className="transition-colors hover:text-fg">
              Create account
            </Link>
            <Link href="/login" className="transition-colors hover:text-fg">
              Sign in
            </Link>
            <Link href="/studio" className="transition-colors hover:text-fg">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-4 text-center text-xs text-muted">
        AgreeMind · Lagos · Built for every creative field
      </div>
    </footer>
  );
}
