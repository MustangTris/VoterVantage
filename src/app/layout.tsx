import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keep standard fonts for now
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DonationModal } from "@/components/donation-modal";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground font-sans selection:bg-purple-500/30 flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <DonationModal />
      </body>
    </html>
  );
}
