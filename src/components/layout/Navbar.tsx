"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiMenu, FiX, FiMessageSquare, FiBell, FiUser, FiLogOut, FiSettings, FiPackage } from "react-icons/fi";
import { IoAddCircle } from "react-icons/io5";
import toast from "react-hot-toast";
import Avatar from "@/components/ui/Avatar";
import Logo from "@/components/brand/Logo";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
    const interval = setInterval(() => {
      if (!document.hidden) fetchCount();
    }, 60000);
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
      setMobileSearchOpen(false);
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
      toast.error("Logout failed. Please try again.");
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
    if (user?.role === "seller") return "bg-sil-yellow-light text-sil-yellow-dark";
    if (user?.isAdmin || user?.role === "admin") return "bg-red-100 text-red-700";
    return "bg-bai-blue-light text-bai-blue";
  };

  return (
    <nav className="sticky top-0 z-40 glass-strong border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Logo tone="navy" size={30} asLink />
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/categories"
                className="text-sm font-bold text-gray-700 hover:text-bai-blue transition-all duration-200 hover:bg-bai-blue-light px-3 py-1.5 rounded-2xl"
              >
                Categories
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-bai-blue transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-bai-blue/20 focus:border-bai-blue focus:bg-white transition-all duration-200 placeholder-gray-400"
                maxLength={200}
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {user && !(user.isAdmin || user.role === "admin") && (
              <Link
                href="/sell"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sil-yellow to-sil-yellow/90 text-white text-sm font-bold rounded-2xl hover:from-sil-yellow/90 hover:to-sil-yellow transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 shadow-cartoon-sm"
              >
                <IoAddCircle className="w-4 h-4" />
                Sell
              </Link>
            )}
            {user && (user.isAdmin || user.role === "admin") && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-2xl hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
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
                  className="relative p-2 text-gray-600 hover:text-bai-blue hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <FiMessageSquare className="w-5 h-5" />
                </Link>
                <Link
                  href="/notifications"
                  className="relative p-2.5 text-gray-600 hover:text-bai-blue hover:bg-bai-blue-light rounded-2xl transition-all duration-200"
                >
                  <FiBell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-coral rounded-full">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-2xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <span className="hidden md:inline text-sm font-bold text-gray-700">{user.name}</span>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium rounded-lg capitalize ${getRoleColor()}`}>
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
                      <Link
                        href="/my-listings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FiPackage className="w-4 h-4 text-gray-400" />
                        My Listings
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-coral hover:bg-red-50 transition-colors"
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
                  className="px-4 py-2 text-sm font-bold text-bai-blue border border-bai-blue/30 rounded-2xl hover:bg-bai-blue-light transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-bai-blue to-bai-blue/90 rounded-2xl hover:from-bai-blue/90 hover:to-bai-blue transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setMobileMenuOpen(false);
              }}
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200"
            >
              {mobileSearchOpen ? <FiX className="w-5 h-5" /> : <FiSearch className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setMobileSearchOpen(false);
              }}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl">
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative group">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-bai-blue transition-colors" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-bai-blue/20 focus:border-bai-blue focus:bg-white transition-all duration-200"
                maxLength={200}
              />
            </div>
          </form>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2">
            {user && !(user.isAdmin || user.role === "admin") && (
              <Link
                href="/sell"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-sil-yellow to-sil-yellow/90 text-white font-bold rounded-2xl shadow-cartoon-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <IoAddCircle className="w-5 h-5" />
                Sell Item
              </Link>
            )}
            {user && (user.isAdmin || user.role === "admin") && (
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-2xl shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            <Link
              href="/categories"
              className="block py-2.5 text-sm text-gray-700 hover:text-bai-blue hover:bg-bai-blue-light rounded-2xl px-3 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            {user ? (
              <>
                <Link
                  href="/offers"
                  className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-bai-blue hover:bg-bai-blue-light rounded-2xl px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiPackage className="w-4 h-4" /> My Offers
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-bai-blue hover:bg-bai-blue-light rounded-2xl px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiBell className="w-4 h-4" /> Notifications {notificationCount > 0 && `(${notificationCount})`}
                </Link>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-bai-blue hover:bg-bai-blue-light rounded-2xl px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiSettings className="w-4 h-4" /> {getDashboardLabel()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2.5 text-sm text-coral hover:bg-red-50 rounded-2xl px-3 transition-all duration-200 w-full text-left"
                >
                  <FiLogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2.5 text-sm text-gray-700 hover:text-bai-blue hover:bg-bai-blue-light rounded-2xl px-3 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block py-2.5 text-sm text-gray-700 hover:text-bai-blue hover:bg-bai-blue-light rounded-2xl px-3 transition-all duration-200"
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
