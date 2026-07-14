import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import RootNav from "@/components/RootNav";

/* ── Fonts ─────────────────────────────────────────────────────────── */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

/* ── Metadata ───────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Code Build Launch",
    template: "%s · Code Build Launch",
  },
  description:
    "The AI-powered coding bootcamp platform by CITN & Build The Circle. Learn, build, compete, and launch real projects.",
  keywords: [
    "coding bootcamp",
    "learn to code",
    "CITN",
    "Build The Circle",
    "student dashboard",
    "AI learning",
    "Next.js",
  ],
  authors: [{ name: "CITN", url: "https://citn.in" }],
  creator: "CITN · Build The Circle",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Code Build Launch",
    description:
      "AI-powered coding bootcamp platform. Manage students, tasks, leaderboards and AI learning from one place.",
    siteName: "Code Build Launch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Build Launch",
    description:
      "AI-powered coding bootcamp platform by CITN & Build The Circle.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* ── Root Layout ────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={[
        spaceGrotesk.variable,
        inter.variable,
        jetbrainsMono.variable,
        "h-full antialiased",
      ].join(" ")}
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0B] text-white">
        <RootNav />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}