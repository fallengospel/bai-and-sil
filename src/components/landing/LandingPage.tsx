"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  FiSearch, FiShield, FiDollarSign, FiTruck, FiStar, FiUsers, 
  FiTrendingUp, FiArrowRight, FiMessageCircle, FiTag, FiCheck,
  FiChevronRight, FiZap, FiHeart, FiShoppingBag, FiChevronLeft
} from "react-icons/fi";
import { IoAddCircle, IoStar } from "react-icons/io5";

const HERO_SLIDES = [
  {
    id: 1,
    type: "logo",
    tagline: "The Filipino Marketplace",
    headline: "BAI & SIL",
    subtitle: "Find stuff. Sell stuff. Repeat.",
    bg: "from-bai-blue via-bai-blue to-bai-blue-dark",
  },
  {
    id: 2,
    type: "product",
    tagline: "Fresh Finds Daily",
    headline: "iPhone 15 Pro Max",
    price: "₱45,000",
    condition: "Like New",
    location: "Makati, Manila",
    seller: "Juan D.",
    sellerRating: 4.9,
    bg: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    accent: "#FFD581",
  },
  {
    id: 3,
    type: "product",
    tagline: "Trending Now",
    headline: "Nike Air Jordan 1",
    price: "₱8,500",
    condition: "Brand New",
    location: "Quezon City",
    seller: "Maria S.",
    sellerRating: 4.8,
    bg: "from-[#2d1b69] via-[#11998e] to-[#38ef7d]",
    accent: "#FFFFFF",
  },
  {
    id: 4,
    type: "stats",
    tagline: "Growing Community",
    headline: "240+ Active Listings",
    stats: [
      { value: "240+", label: "Items for Sale" },
      { value: "12", label: "Categories" },
      { value: "100%", label: "Free to List" },
    ],
    bg: "from-[#0c0c1d] via-[#1a1a3e] to-[#2d1b69]",
    accent: "#00D2D3",
  },
  {
    id: 5,
    type: "seller",
    tagline: "Seller Spotlight",
    headline: "Start Selling Today",
    subtitle: "List your items in seconds. Reach thousands of buyers. No commission, no fees.",
    cta: "Magbenta Na!",
    bg: "from-[#ff6b6b] via-[#ee5a24] to-[#f39c12]",
    accent: "#FFFFFF",
  },
];

const FEATURES = [
  {
    icon: <FiTag className="w-6 h-6" />,
    title: "List for Free",
    description: "Walang commission. Walang hidden fees. Benta mo agad, kita mo agad.",
    color: "bg-bai-blue-light text-bai-blue",
  },
  {
    icon: <FiShield className="w-6 h-6" />,
    title: "Safe & Secure",
    description: "Verified sellers. Secure transactions. Hindi ka maiiwan.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: <FiMessageCircle className="w-6 h-6" />,
    title: "Direct Chat",
    description: "Message the seller directly. Negotiate, ask questions, arrange meet-up.",
    color: "bg-sil-yellow-light text-sil-yellow-dark",
  },
  {
    icon: <FiTruck className="w-6 h-6" />,
    title: "Meet-up Ready",
    description: "Face-to-face transactions. Meet sa public place, safe ka pa rin.",
    color: "bg-purple-100 text-purple-600",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Browse",
    description: "Hanapin ang gusto mo sa 240+ items across 12 categories.",
    icon: <FiSearch className="w-7 h-7" />,
    color: "from-bai-blue to-bai-blue-hover",
  },
  {
    number: "02",
    title: "Deal",
    description: "Message the seller, mag-offer, negotiate the price.",
    icon: <FiMessageCircle className="w-7 h-7" />,
    color: "from-sil-yellow to-sil-yellow-dark",
  },
  {
    number: "03",
    title: "Meet-up",
    description: "Arrange meet-up, check the item, pay directly. Done!",
    icon: <FiHeart className="w-7 h-7" />,
    color: "from-emerald-400 to-emerald-500",
  },
];

const CATEGORIES = [
  { name: "Electronics", icon: "📱", count: "45+" },
  { name: "Fashion", icon: "👗", count: "38+" },
  { name: "Home Living", icon: "🏠", count: "32+" },
  { name: "Vehicles", icon: "🚗", count: "28+" },
  { name: "Beauty", icon: "💄", count: "25+" },
  { name: "Gaming", icon: "🎮", count: "20+" },
];

const STATS = [
  { number: "240+", label: "Active Listings", icon: <FiShoppingBag className="w-5 h-5" /> },
  { number: "12", label: "Categories", icon: <FiTag className="w-5 h-5" /> },
  { number: "100%", label: "Free", icon: <FiDollarSign className="w-5 h-5" /> },
  { number: "24/7", label: "Available", icon: <FiZap className="w-5 h-5" /> },
];

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-bai-blue via-bai-blue to-bai-blue-dark text-white min-h-[90vh] flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          {/* Glows */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sil-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-bai-blue-hover/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container-wide py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Overline badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-caption uppercase tracking-wider text-blue-100">Pinoy Marketplace</span>
              </div>
              
              {/* Hero headline */}
              <h1 className="text-hero md:text-[4rem] lg:text-[4.5rem] font-black mb-6 leading-[1.05] tracking-tight">
                Hanap, Benta,{" "}
                <span className="relative inline-block">
                  <span className="text-sil-yellow relative z-10">I-repeat!</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-sil-yellow/20 -z-0 rounded-full" />
                </span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-body-lg text-blue-100/80 mb-10 leading-relaxed max-w-lg">
                Ang marketplace na gawa ng Pinas, para sa Pinas. 
                Mag-browse, magbenta, at mag-deal — walang hassle, walang patong.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/search"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-bai-blue font-bold rounded-2xl shadow-cartoon hover:bg-blue-50 transition-all duration-200 hover:shadow-cartoon-lg hover:-translate-y-0.5 text-body"
                >
                  <FiSearch className="w-5 h-5" />
                  Mag-browse Na
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/sell"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sil-yellow to-sil-yellow-dark text-white font-bold rounded-2xl shadow-cartoon hover:from-sil-yellow-dark hover:to-sil-yellow transition-all duration-200 hover:shadow-cartoon-lg hover:-translate-y-0.5 text-body"
                >
                  <IoAddCircle className="w-5 h-5" />
                  Magbenta Na
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-10 mt-12 pt-8 border-t border-white/10">
                {STATS.slice(0, 3).map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-sil-yellow">{stat.icon}</span>
                      <span className="text-2xl md:text-3xl font-black text-white">{stat.number}</span>
                    </div>
                    <span className="text-caption text-blue-200">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right - Hero Carousel */}
            <div 
              className={`hidden lg:block transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative">
                {/* Main carousel container */}
                <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${slide.bg} transition-all duration-500`}>
                  {/* Slide content */}
                  <div className="relative min-h-[480px] p-8 flex flex-col">
                    {/* Tagline */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6 w-fit">
                      <span className="w-2 h-2 bg-sil-yellow rounded-full animate-pulse" />
                      <span className="text-caption uppercase tracking-wider text-white/80">{slide.tagline}</span>
                    </div>

                    {/* Content based on slide type */}
                    {slide.type === "logo" && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-8 animate-float">
                          <img src="/logo.svg" alt="BAI & SIL" className="w-24 h-24" />
                        </div>
                        <h2 className="text-[3.5rem] font-black text-white mb-2 tracking-tight">{slide.headline}</h2>
                        <p className="text-xl text-white/70">{slide.subtitle}</p>
                      </div>
                    )}

                    {slide.type === "product" && (
                      <div className="flex-1 flex flex-col">
                        {/* Product image placeholder - large visual */}
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 flex items-center justify-center min-h-[280px] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                          <div className="text-8xl relative z-10 drop-shadow-lg">
                            {currentSlide === 1 ? "📱" : "👟"}
                          </div>
                          {/* Floating price tag */}
                          <div className="absolute top-4 right-4 bg-white rounded-xl px-4 py-2 shadow-lg">
                            <span className="text-heading-2 font-black text-bai-blue">{slide.price}</span>
                          </div>
                          {/* Condition badge */}
                          <div className="absolute bottom-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-caption font-bold">
                            {slide.condition}
                          </div>
                        </div>
                        
                        {/* Product info */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-white">{slide.headline}</h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-white">{slide.seller?.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="text-body-sm font-medium text-white">{slide.seller}</p>
                                <div className="flex items-center gap-1">
                                  <IoStar className="w-3 h-3 text-sil-yellow fill-sil-yellow" />
                                  <span className="text-caption text-white/70">{slide.sellerRating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-caption text-white/60">{slide.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {slide.type === "stats" && (
                      <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-4xl font-black text-white mb-8">{slide.headline}</h2>
                        <div className="grid grid-cols-3 gap-4">
                          {slide.stats?.map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
                              <p className="text-caption text-white/60">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {slide.type === "seller" && (
                      <div className="flex-1 flex flex-col justify-center text-center">
                        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <IoAddCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4">{slide.headline}</h2>
                        <p className="text-lg text-white/80 mb-8 max-w-sm mx-auto">{slide.subtitle}</p>
                        <Link
                          href="/sell"
                          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 mx-auto"
                        >
                          {slide.cta}
                          <FiArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>

                {/* Slide indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentSlide 
                          ? "w-8 bg-white" 
                          : "w-2 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div 
                    className="h-full bg-sil-yellow transition-all duration-300"
                    style={{ 
                      width: `${((currentSlide + 1) / HERO_SLIDES.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-wide py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <FiShield className="w-5 h-5" />, title: "Secure", sub: "Safe transactions", color: "bg-bai-blue-light text-bai-blue" },
              { icon: <FiDollarSign className="w-5 h-5" />, title: "Free Lang", sub: "Walang patong", color: "bg-emerald-100 text-emerald-600" },
              { icon: <FiTruck className="w-5 h-5" />, title: "Meet-up", sub: "Face-to-face deal", color: "bg-sil-yellow-light text-sil-yellow-dark" },
              { icon: <FiUsers className="w-5 h-5" />, title: "Pinoy Made", sub: "Gawa sa Pinas", color: "bg-purple-100 text-purple-600" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-body-sm font-bold text-gray-900">{item.title}</p>
                  <p className="text-caption text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-surface">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="badge-overline mb-4 inline-block">Features</span>
            <h2 className="section-title mb-4">Bakit BAI & SIL?</h2>
            <p className="section-subtitle mx-auto">
              The Filipino marketplace designed for simplicity, safety, and community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <div 
                key={i} 
                className="feature-card card-interactive p-6 text-center group"
              >
                <div className={`feature-icon ${feature.color} mx-auto mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-heading-3 font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-body-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="badge-overline mb-4 inline-block">How It Works</span>
            <h2 className="section-title mb-4">Paano Gamitin?</h2>
            <p className="section-subtitle mx-auto">
              Simple lang, promise! Three steps lang para mag-start.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-bai-blue via-sil-yellow to-emerald-400 opacity-20" />
            
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center group">
                {/* Step number */}
                <div className="relative inline-flex mb-6">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-cartoon group-hover:shadow-cartoon-lg transition-all duration-300 group-hover:-translate-y-1`}>
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-card flex items-center justify-center text-caption font-bold text-bai-blue">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-heading-2 font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-body text-gray-500 max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="section-padding bg-surface">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="badge-overline mb-4 inline-block">Explore</span>
              <h2 className="section-title mb-2">Categories</h2>
              <p className="text-body text-gray-500">Hanapin mo ang hinahanap mo</p>
            </div>
            <Link
              href="/categories"
              className="hidden md:inline-flex items-center gap-2 text-body-sm font-bold text-bai-blue hover:text-bai-blue-hover transition-colors group"
            >
              Lahat ng categories
              <FiChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                href={`/search?category=${cat.name.toLowerCase().replace(' ', '-')}`}
                className="card-interactive p-5 text-center group"
              >
                <div className="text-4xl mb-3 transition-transform group-hover:scale-110 group-hover:-rotate-3">{cat.icon}</div>
                <h3 className="text-body-sm font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-caption text-gray-500">{cat.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="relative overflow-hidden bg-gradient-to-br from-bai-blue via-bai-blue to-bai-blue-dark rounded-3xl p-8 md:p-16 text-white">
            {/* Background decorations */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-sil-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            </div>
            
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                  <IoAddCircle className="w-4 h-4 text-sil-yellow" />
                  <span className="text-caption uppercase tracking-wider text-blue-100">For Sellers</span>
                </span>
                
                <h2 className="text-display md:text-hero-sm font-black mb-4 leading-tight">
                  May benta ka ba?{" "}
                  <span className="text-sil-yellow">I-list na!</span>
                </h2>
                <p className="text-body-lg text-blue-100/80">
                  Free lang mag-list. Walang commission. Walang hidden fees. 
                  Benta mo agad, kita mo agad. Promise!
                </p>
              </div>
              
              <Link
                href="/sell"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-sil-yellow to-sil-yellow-dark text-white font-bold rounded-2xl shadow-cartoon-lg hover:from-sil-yellow-dark hover:to-sil-yellow transition-all duration-200 hover:shadow-cartoon hover:-translate-y-1 whitespace-nowrap text-body-lg"
              >
                <IoAddCircle className="w-6 h-6" />
                Magbenta Na!
                <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4 transition-all group-hover:bg-white/20 group-hover:scale-110 group-hover:-rotate-3">
                  <span className="text-sil-yellow">{stat.icon}</span>
                </div>
                <p className="text-4xl md:text-5xl font-black mb-1">{stat.number}</p>
                <p className="text-body-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-surface">
        <div className="container-narrow text-center">
          <h2 className="section-title mb-4">Ready to start?</h2>
          <p className="section-subtitle mx-auto mb-10">
            Join the growing Filipino marketplace community. Buy, sell, connect.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary btn-lg shadow-cartoon-lg"
            >
              Create Account — Free
            </Link>
            <Link
              href="/search"
              className="btn-outline btn-lg"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
