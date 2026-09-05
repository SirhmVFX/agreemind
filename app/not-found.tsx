import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold">404</p>
      <h1 className="font-serif mt-3 text-5xl">Nothing here.</h1>
      <Link href="/" className="btn btn-gold mt-8">
        Back to AgreeMind
      </Link>
    </div>
  );
}
