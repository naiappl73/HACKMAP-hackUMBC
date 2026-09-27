import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { Sora, Manrope, JetBrains_Mono, Atkinson_Hyperlegible } from "next/font/google";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const atkinson = Atkinson_Hyperlegible({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-atkinson" });

export const metadata = { title: "RetrieversPath", description: "Career roadmaps for UMBC students" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${sora.variable} ${manrope.variable} ${mono.variable} ${atkinson.variable} bg-bg text-ink font-sans`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:px-4 focus:py-2 focus:rounded-full">Skip to content</a>
        <SiteHeader />
        <main id="main" className="min-h-[70vh]">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-wrap justify-between gap-4 text-sm text-ink-3">
            <p>RetrieversPath · Built at hackUMBC 2026</p>
            <p>Anaiah, Martin &amp; Paul</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
