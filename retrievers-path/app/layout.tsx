import "./globals.css";
// Fonts ship inside node_modules (no Google download at build/start, so it works offline).
import "@fontsource-variable/sora";
import "@fontsource-variable/manrope";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/SiteHeader";
import { A11Y_INIT_SCRIPT } from "@/lib/a11y-script";
import LiquidBackground from "@/components/LiquidBackground";

export const metadata: Metadata = {
  title: "RetrieversPath",
  description: "Career roadmaps for UMBC students",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF9F4" },
    { media: "(prefers-color-scheme: dark)", color: "#111214" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The init script sets classes on <html> before React loads, so React must not complain about them.
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT_SCRIPT }} />
      </head>
      <body className="bg-bg text-ink font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:px-4 focus:py-2 focus:rounded-full">Skip to content</a>
        <LiquidBackground />
        <SiteHeader />
        <main id="main" className="min-h-[70vh]">{children}</main>
        <footer className="border-t border-line relative">
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-wrap justify-between gap-4 text-sm text-ink-3">
            <p>RetrieversPath · Built at hackUMBC 2026</p>
            <p>Anaiah, Martin &amp; Paul</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
