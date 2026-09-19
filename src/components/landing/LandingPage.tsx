"use client";

import Link from "next/link";
import { FiSearch, FiMessageCircle, FiHeart, FiTag, FiShield, FiTruck } from "react-icons/fi";
import { HeroVisual, HeroSearchBar } from "@/components/hero";

const FEATURES = [
  {
    icon: <FiTag className="w-6 h-6" />,
    title: "List for free",
    desc: "Walang commission. Walang hidden fees. Post mo agad, kita mo agad.",
  },
  {
    icon: <FiShield className="w-6 h-6" />,
    title: "Meet-up safe",
    // TODO(owner): confirm trust claims
    desc: "Meet sa public place. Check muna bago magbayad.",
  },
  {
    icon: <FiTruck className="w-6 h-6" />,
    title: "Meet-up ready",
    desc: "Face-to-face transactions. Dala ka lang ng cash, okay na.",
  },
];

const STEPS = [
  { num: "01", title: "Browse", desc: "Hanapin ang gusto mo.", icon: <FiSearch className="w-6 h-6" /> },
  { num: "02", title: "Deal", desc: "Message seller, mag-offer, negotiate.", icon: <FiMessageCircle className="w-6 h-6" /> },
  { num: "03", title: "Meet-up", desc: "Check item, pay directly. Done!", icon: <FiHeart className="w-6 h-6" /> },
];

const CATS = [
  { name: "Electronics", slug: "electronics", icon: "phone", tall: true },
  { name: "Fashion", slug: "fashion", icon: "shirt", tall: false },
  { name: "Home Living", slug: "home-living", icon: "home", tall: false },
  { name: "Vehicles", slug: "vehicles", icon: "car", tall: true },
  { name: "Beauty", slug: "beauty", icon: "sparkle", tall: false },
  { name: "Gaming", slug: "gaming", icon: "gamepad", tall: false },
];

function CatIcon({ icon }: { icon: string }) {
  const cls = "w-7 h-7 text-[#0F3D91]";
  const p = { className: cls, viewBox: "0 0 24 24" as const, fill: "none" as const, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "phone": return <svg {...p}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
    case "shirt": return <svg {...p}><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" /></svg>;
    case "home": return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
    case "car": return <svg {...p}><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>;
    case "sparkle": return <svg {...p}><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" /></svg>;
    case "gamepad": return <svg {...p}><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><circle cx="15" cy="13" r="1" fill="currentColor" /><circle cx="18" cy="11" r="1" fill="currentColor" /><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
    default: return <FiTag className={cls} />;
  }
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#0F3D91] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
            <div className="flex flex-col gap-6 lg:gap-8 py-8 lg:py-16">
              <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.05] font-black tracking-tight">
                Hanap, Benta,{" "}
                <span className="text-[#FFC72C]">I-repeat!</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md leading-relaxed">
                Ang marketplace na gawa ng Pinas. Mag-browse, magbenta, mag-deal.
                Walang patong.
              </p>
              <HeroSearchBar />
              <p className="text-sm text-white/60">
                Libreng mag-list, direct chat, meet-up sa public place.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC72C] text-[#101B3A] text-sm font-bold rounded-lg hover:bg-[#E6B820] transition-colors"
                >
                  Magbenta na
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 bg-[#EAF0FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#101B3A] mb-12">
            Bakit BAI &amp; SIL?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`bg-white p-6 rounded-2xl ${
                  i === 0
                    ? "shadow-lg border-2 border-[#0F3D91]/10"
                    : "shadow-sm border border-gray-100"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#EAF0FB] flex items-center justify-center text-[#0F3D91] mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-[#101B3A] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#101B3A] mb-12">
            Paano Gamitin?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-[#0F3D91]/10" />
            {STEPS.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="relative inline-flex mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#0F3D91] text-white flex items-center justify-center shadow-md">
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#FFC72C] text-[#101B3A] rounded-full flex items-center justify-center text-xs font-bold">
                    {s.num}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#101B3A] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24 bg-[#EAF0FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#101B3A]">
              Categories
            </h2>
            <Link href="/categories" className="text-sm font-bold text-[#0F3D91] hover:underline hidden sm:block">
              Lahat ng categories
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATS.map((c) => (
              <Link
                key={c.slug}
                href={`/search?category=${c.slug}`}
                className={`bg-white p-5 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100 ${c.tall ? "md:row-span-2 md:p-8" : ""}`}
              >
                <CatIcon icon={c.icon} />
                <span className="font-display font-bold text-[#101B3A]">{c.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link href="/categories" className="text-sm font-bold text-[#0F3D91] hover:underline">
              Lahat ng categories
            </Link>
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-16 lg:py-24 bg-[#0F3D91] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              May benta ka ba?
              <br />
              <span className="text-[#FFC72C]">I-list na, libre.</span>
            </h2>
            <p className="text-white/70 mb-8">
              Photo, title, price, post. Ganun lang kadali. Walang commission, walang hidden fees.
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFC72C] text-[#101B3A] font-bold rounded-lg hover:bg-[#E6B820] transition-colors"
            >
              Magbenta na
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#101B3A] mb-4">
            Ready ka na?
          </h2>
          <p className="text-gray-500 mb-8">
            Join the Filipino marketplace. Buy, sell, connect.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary">
              Create Account
            </Link>
            <Link href="/search" className="btn-outline">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
