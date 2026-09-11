"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiMenu, FiX, FiMessageSquare, FiBell, FiSun, FiMoon, FiGlobe, FiUser, FiLogOut, FiSettings, FiPackage } from "react-icons/fi";
import { IoAddCircle } from "react-icons/io5";
import Avatar from "@/components/ui/Avatar";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useI18n } from "@/components/layout/I18nProvider";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
  isAdmin?: boolean;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const handleStorage = () => fetchUser();
    const handleFocus = () => fetchUser();
    const handleAuthChange = () => fetchUser();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [fetchUser]);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/count", { credentials: "include" });
        const data = await res.json();
        setNotificationCount(data.count || 0);
      } catch {
        setNotificationCount(0);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      window.dispatchEvent(new Event("auth-change"));
      router.push("/");
    } catch {
      console.error("Logout failed");
    }
  };

  const getDashboardLink = () => {
    if (user?.isAdmin || user?.role === "admin") return "/admin";
    if (user?.role === "seller") return "/seller/dashboard";
    return "/buyer/dashboard";
  };

  const getDashboardLabel = () => {
    if (user?.isAdmin || user?.role === "admin") return "Admin Panel";
    if (user?.role === "seller") return "Seller Dashboard";
    return "Buyer Hub";
  };

  const getRoleColor = () => {
    if (user?.role === "seller") return "bg-[#f5a623]/10 text-[#d4901a]";
    if (user?.isAdmin || user?.role === "admin") return "bg-red-100 text-red-700";
    return "bg-[#1a56db]/10 text-[#1a56db]";
  };

  return (
    <nav className="sticky top-0 z-40 glass-strong border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/logo.svg" alt="BAI & SIL" className="w-8 h-8" />
              <span className="text-xl font-bold gradient-text">
                BAI <span className="text-[#f5a623]">&amp;</span> SIL
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/categories"
                className="text-sm font-medium text-gray-700 hover:text-[#1a56db] transition-all duration-200 hover:bg-[#1a56db]/5 px-3 py-1.5 rounded-lg"
              >
                Categories
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#1a56db] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] focus:bg-white transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {user?.role === "seller" && (
              <Link
                href="/sell"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#f5a623] to-[#f5a623]/90 text-white text-sm font-medium rounded-xl hover:from-[#f5a623]/90 hover:to-[#f5a623] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <IoAddCircle className="w-4 h-4" />
                Sell
              </Link>
            )}
            {user && (user.isAdmin || user.role === "admin") && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-medium rounded-xl hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Admin
              </Link>
            )}

            {loading ? (
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/messages"
                  className="relative p-2 text-gray-600 hover:text-[#1a56db] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiMessageSquare className="w-5 h-5" />
                </Link>
                <Link
                  href="/notifications"
                  className="relative p-2.5 text-gray-600 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-xl transition-all duration-200"
                >
                  <FiBell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-[#e8634a] rounded-full">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={toggleTheme}
                  className="p-2.5 text-gray-600 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-xl transition-all duration-200"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setLanguage(language === "en" ? "fil" : "en")}
                  className="p-2.5 text-gray-600 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-xl transition-all duration-200 text-xs font-bold"
                  title={language === "en" ? "Switch to Filipino" : "Switch to English"}
                >
                  <FiGlobe className="w-5 h-5" />
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <span className="hidden md:inline text-sm font-medium text-gray-700">{user.name}</span>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${getRoleColor()}`}>
                          {user.role || "buyer"}
                        </span>
                      </div>
                      <Link
                        href="/profile/me"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FiUser className="w-4 h-4 text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FiSettings className="w-4 h-4 text-gray-400" />
                        {getDashboardLabel()}
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FiMessageSquare className="w-4 h-4 text-gray-400" />
                        Messages
                      </Link>
                      <Link
                        href="/offers"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FiPackage className="w-4 h-4 text-gray-400" />
                        My Offers
                      </Link>
                      {user.role === "seller" && (
                        <Link
                          href="/my-listings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <FiPackage className="w-4 h-4 text-gray-400" />
                          My Listings
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#e8634a] hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#1a56db] border border-[#1a56db]/30 rounded-xl hover:bg-[#1a56db]/5 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#1a56db] to-[#1a56db]/90 rounded-xl hover:from-[#1a56db]/90 hover:to-[#1a56db] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative group">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#1a56db] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] focus:bg-white transition-all duration-200"
              />
            </div>
          </form>
          <div className="px-4 pb-4 space-y-2">
            {user?.role === "seller" && (
              <Link
                href="/sell"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#f5a623] to-[#f5a623]/90 text-white font-medium rounded-xl shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <IoAddCircle className="w-5 h-5" />
                Sell Item
              </Link>
            )}
            {user && (user.isAdmin || user.role === "admin") && (
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-xl shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            <Link
              href="/categories"
              className="block py-2.5 text-sm text-gray-700 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-lg px-3 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            {user ? (
              <>
                <Link
                  href="/messages"
                  className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiMessageSquare className="w-4 h-4" /> Messages
                </Link>
                <Link
                  href="/offers"
                  className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiPackage className="w-4 h-4" /> My Offers
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiBell className="w-4 h-4" /> Notifications {notificationCount > 0 && `(${notificationCount})`}
                </Link>
                <Link
                  href="/profile/me"
                  className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiUser className="w-4 h-4" /> My Profile
                </Link>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-lg px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiSettings className="w-4 h-4" /> {getDashboardLabel()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2.5 text-sm text-[#e8634a] hover:bg-red-50 rounded-lg px-3 transition-all duration-200 w-full text-left"
                >
                  <FiLogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2.5 text-sm text-gray-700 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-lg px-3 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block py-2.5 text-sm text-gray-700 hover:text-[#1a56db] hover:bg-[#1a56db]/5 rounded-lg px-3 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
