"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { isFirebaseConfigured } from "@/lib/config";
import { useStore } from "@/lib/store";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signInDemo, signInWithPassword, signUpWithPassword, firebaseOn } =
    useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = firebaseOn || isFirebaseConfigured();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUpWithPassword(name || email.split("@")[0], email, password);
      } else {
        await signInWithPassword(email, password);
      }
      router.push("/studio");
    } catch (err) {
      setError(firebaseMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-5 py-16">
      <Logo />
      <form
        onSubmit={submit}
        className="mt-10 w-full max-w-md rounded-2xl border border-line bg-bg2 p-8"
      >
        <h1 className="font-serif text-4xl">
          {mode === "signup" ? "Open a studio" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {configured
            ? "Your invoices live in Firebase. Create as many as you need, then download or share each one."
            : "Add Firebase keys in .env.local to save across devices. Demo mode stays on this browser."}
        </p>
        {mode === "signup" && (
          <label className="mt-6 block">
            <span className="label">Your name</span>
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        )}
        <label className="mt-4 block">
          <span className="label">Email</span>
          <input
            className="field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mt-4 block">
          <span className="label">Password</span>
          <input
            className="field"
            type="password"
            value={password}
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        <button className="btn btn-gold mt-6 w-full" type="submit" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "signup"
              ? "Create studio"
              : "Sign in"}
        </button>
        <button
          type="button"
          className="btn btn-ghost mt-3 w-full"
          onClick={() => {
            signInDemo();
            router.push("/studio");
          }}
        >
          Use the demo studio
        </button>
        <p className="mt-5 text-center text-sm text-muted">
          {mode === "signup" ? (
            <>
              Already here? <Link href="/login">Sign in</Link>
            </>
          ) : (
            <>
              New? <Link href="/signup">Create a studio</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

function firebaseMessage(err: unknown) {
  const code = typeof err === "object" && err && "code" in err ? String(err.code) : "";
  if (code.includes("email-already-in-use")) return "That email already has a studio.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Email or password is wrong.";
  }
  if (code.includes("weak-password")) return "Use at least 6 characters.";
  if (err instanceof Error) return err.message;
  return "Could not sign in.";
}
