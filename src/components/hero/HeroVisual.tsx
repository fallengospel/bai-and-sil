"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneIllustration, SneakerIllustration, FanIllustration, ControllerIllustration } from "./ProductIllustrations";
import ChatBubble from "./ChatBubble";
import PriceTag from "./PriceTag";
import SoldStamp from "./SoldStamp";

const LISTING_CARDS = [
  {
    id: 1,
    name: "iPhone 13 Pro",
    price: "P18,500",
    city: "Quezon City",
    condition: "Like new",
    rotation: -3,
    x: 0,
    y: 0,
    illustration: "phone",
  },
  {
    id: 2,
    name: "Nike Air Max",
    price: "P3,200",
    city: "Cebu City",
    condition: "Good",
    rotation: 2,
    x: 180,
    y: -20,
    illustration: "sneaker",
  },
  {
    id: 3,
    name: "Electric Fan",
    price: "P850",
    city: "Davao",
    condition: "Working",
    rotation: -1,
    x: 40,
    y: 200,
    illustration: "fan",
  },
  {
    id: 4,
    name: "PS5 Controller",
    price: "P1,800",
    city: "Iloilo",
    condition: "Like new",
    rotation: 3,
    x: 200,
    y: 160,
    illustration: "controller",
  },
];

function ListingCard({
  card,
  sold,
  entering,
}: {
  card: (typeof LISTING_CARDS)[number];
  sold?: boolean;
  entering?: boolean;
}) {
  const Illustration =
    card.illustration === "phone"
      ? PhoneIllustration
      : card.illustration === "sneaker"
      ? SneakerIllustration
      : card.illustration === "fan"
      ? FanIllustration
      : ControllerIllustration;

  return (
    <div
      className={`absolute w-[170px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-700 ${
        entering ? "opacity-0 translate-x-8" : "opacity-100"
      } ${sold ? "opacity-40 scale-95" : ""}`}
      style={{
        transform: `rotate(${card.rotation}deg) translate(${card.x}px, ${card.y}px)`,
      }}
    >
      <div className="h-[90px] bg-bai-blue-light flex items-center justify-center p-3">
        <Illustration className="w-full h-full" />
      </div>
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-bold text-ink leading-tight truncate">
            {card.name}
          </p>
          <span className="shrink-0 text-[10px] font-medium text-bai-blue bg-bai-blue-light px-1.5 py-0.5 rounded-lg">
            {card.condition}
          </span>
        </div>
        <PriceTag price={card.price} className="mt-1.5" />
        <p className="text-[10px] text-gray-500 mt-1">{card.city}</p>
      </div>
    </div>
  );
}

export default function HeroVisual() {
  const [phase, setPhase] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver - pause when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Pause when tab is hidden
  useEffect(() => {
    const handler = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Animation loop
  useEffect(() => {
    if (isReducedMotion || !isVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setPhase((p) => (p + 1) % 5);
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReducedMotion, isVisible]);

  // Reduced motion: show static final frame
  if (isReducedMotion) {
    return (
      <div ref={containerRef} className="relative w-full h-[340px] lg:h-[420px]" aria-hidden="true">
        <ListingCard card={LISTING_CARDS[0]} />
        <ListingCard card={LISTING_CARDS[1]} />
        <ListingCard card={LISTING_CARDS[2]} />
        <ListingCard card={LISTING_CARDS[3]} />
        {/* Chat panel */}
        <div className="absolute top-[60px] left-[240px] w-[220px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-3 space-y-2">
          <ChatBubble sender="buyer" message="Available pa po ba?" />
          <ChatBubble sender="seller" message="Yes bai! Meet tayo sa mall?" />
          <ChatBubble sender="buyer" message="Deal! Pwede tawad?" />
        </div>
        <SoldStamp className="absolute top-[30px] left-[180px] w-[80px] rotate-[-12deg]" />
      </div>
    );
  }

  // Animation phases:
  // 0: cards deal in
  // 1: chat lines appear one by one
  // 2: SOLD stamp lands
  // 3: new card slides in (the "I-repeat" moment)
  // 4: hold

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[340px] lg:h-[420px]"
      aria-hidden="true"
    >
      {/* Listing cards */}
      {LISTING_CARDS.map((card, i) => {
        const cardPhase = phase >= 1 ? 1 : 0;
        const isSold = phase >= 2 && card.id === 3;
        const isNew = phase === 3 && card.id === 4;

        return (
          <div
            key={card.id}
            className={`transition-all duration-700 ${
              cardPhase === 0 && i > phase ? "opacity-0 scale-90" : "opacity-100 scale-100"
            }`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <ListingCard
              card={card}
              sold={isSold}
              entering={isNew}
            />
          </div>
        );
      })}

      {/* Chat panel - appears in phase 1+ */}
      <div
        className={`absolute top-[60px] left-[240px] w-[220px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-3 space-y-2 transition-all duration-500 ${
          phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <ChatBubble
          sender="buyer"
          message="Available pa po ba?"
          delay={phase >= 1 ? 0 : 999}
          className={`transition-all duration-300 ${
            phase >= 1 ? "opacity-100" : "opacity-0"
          }`}
        />
        <ChatBubble
          sender="seller"
          message="Yes bai! Meet tayo sa mall?"
          delay={phase >= 1 ? 400 : 999}
          className={`transition-all duration-300 ${
            phase >= 2 ? "opacity-100" : "opacity-0"
          }`}
        />
        <ChatBubble
          sender="buyer"
          message="Deal! Pwede tawad?"
          delay={phase >= 2 ? 400 : 999}
          className={`transition-all duration-300 ${
            phase >= 3 ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* SOLD stamp - appears in phase 2+ */}
      <div
        className={`absolute top-[30px] left-[180px] w-[80px] transition-all duration-300 ${
          phase >= 2
            ? "opacity-100 rotate-[-12deg] scale-100"
            : "opacity-0 rotate-[-25deg] scale-75"
        }`}
      >
        <SoldStamp />
      </div>
    </div>
  );
}
