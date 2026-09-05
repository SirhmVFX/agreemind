import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "AgreeMind — Invoices & contracts for creatives",
    template: "%s · AgreeMind",
  },
  description:
    "Invoice any client, in any field. Customize the paper. Attach an AI-written project agreement. Built for creators, studios, engineers, and everyone who gets paid for the work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col bg-bg text-fg">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
