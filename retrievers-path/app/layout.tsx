import "./globals.css";
import { Sora, Manrope, JetBrains_Mono, Atkinson_Hyperlegible } from "next/font/google";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const atkinson = Atkinson_Hyperlegible({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-atkinson" });

export const metadata = { title: "RetrieversPath", description: "Career roadmaps for UMBC students" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${manrope.variable} ${mono.variable} ${atkinson.variable} bg-bg text-ink font-sans`}>
        <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
