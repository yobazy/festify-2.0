import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TasteStoreHydrator } from "@/components/taste/TasteStoreHydrator";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

// Display + body: Archivo's width axis gives the wide, heavy poster headlines.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

// Facts: dates, venues, set times.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "Front Left",
  title: {
    default: "Front Left — who's playing, and why you should care",
    template: "%s — Front Left",
  },
  description:
    "Upcoming shows and festivals ranked by the strength of the whole lineup. Hear the lineup before you go.",
  // The site is dark by design; stop Dark Reader from re-inverting it.
  other: { "darkreader-lock": "true" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`dark ${archivo.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <TasteStoreHydrator />
        <Navbar userEmail={user?.email ?? null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
