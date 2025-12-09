import type { Metadata } from "next";
import { Geist, Geist_Mono, UnifrakturMaguntia, Playfair_Display } from "next/font/google"; // Keep standard fonts for now
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DonationModal } from "@/components/donation-modal";
import { DonationSection } from "@/components/donation-section";
import { Toaster } from "@/components/ui/toaster";
import { AsciiDotBackground } from "@/components/ascii-dot-background";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unifraktur = UnifrakturMaguntia({
  weight: "400",
  variable: "--font-unifraktur",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "VoterVantage | Transparent Campaign Finance",
  description: "Explore city-level political finance data. Empowering voters with transparency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${unifraktur.variable} ${playfair.variable} antialiased min-h-screen bg-background text-foreground font-sans selection:bg-purple-500/30 flex flex-col`}
      >
        <AsciiDotBackground />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <DonationSection />
        <Footer />
        <DonationModal />
        <Toaster />
      </body>
    </html>
  );
}
