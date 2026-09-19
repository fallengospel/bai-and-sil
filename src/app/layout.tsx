import type { Metadata } from "next";
import { Gabarito, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { I18nProvider } from "@/components/layout/I18nProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import UXTestingMode from "@/components/dev/UXTestingMode";
import { Toaster } from "react-hot-toast";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0F3D91" />
      </head>
      <body
        className={`${gabarito.variable} ${hankenGrotesk.variable} font-sans antialiased bg-white text-[#101B3A] transition-colors duration-200`}
      >
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <Toaster position="top-right" />
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <div className="md:hidden">
                <MobileNav />
              </div>
              <UXTestingMode />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
