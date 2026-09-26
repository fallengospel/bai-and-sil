import type { Metadata } from "next";
import { Gabarito, Hanken_Grotesk } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import AppToaster from "@/components/layout/AppToaster";

const UXTestingMode = dynamic(() => import("@/components/dev/UXTestingMode"), { ssr: false });

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BAI AND SIL - Find stuff. Sell stuff. Repeat.",
  description:
    "The Filipino marketplace for buying and selling pre-loved items. Find deals, sell your stuff, repeat.",
  icons: {
    icon: "/icon-512.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "BAI AND SIL - Find stuff. Sell stuff. Repeat.",
    description:
      "The Filipino marketplace for buying and selling pre-loved items. Find deals, sell your stuff, repeat.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BAI & SIL - Filipino Marketplace",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#023E8A" />
      </head>
      <body
        className={`${gabarito.variable} ${hankenGrotesk.variable} font-sans antialiased bg-white text-ink transition-colors duration-200`}
      >
        <AuthProvider>
            <AppToaster />
            <div className="flex flex-col min-h-screen pb-16 md:pb-0">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <div className="md:hidden">
              <MobileNav />
            </div>
            <UXTestingMode />
        </AuthProvider>
      </body>
    </html>
  );
}
