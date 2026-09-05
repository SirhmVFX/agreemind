import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-serif text-[1.35rem] tracking-tight">AgreeMind</span>
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted">
        studio
      </span>
    </Link>
  );
}
