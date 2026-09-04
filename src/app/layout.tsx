import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "BAI AND SIL - Find stuff. Sell stuff. Repeat.",
  description:
    "The Filipino marketplace for buying and selling pre-loved items. Find deals, sell your stuff, repeat.",
  openGraph: {
    title: "BAI AND SIL",
    description: "Find stuff. Sell stuff. Repeat.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
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
        </AuthProvider>
      </body>
    </html>
  );
}
