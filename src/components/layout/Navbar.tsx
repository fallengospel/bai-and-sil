"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiMenu, FiX, FiMessageSquare } from "react-icons/fi";
import { IoAddCircle } from "react-icons/io5";
import Avatar from "@/components/ui/Avatar";

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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
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
    };
    fetchUser();
  }, []);

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
    if (user?.isAdmin || user?.role === "admin") return "Admin Dashboard";
    if (user?.role === "seller") return "Seller Dashboard";
    return "Buyer Dashboard";
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-[#1a56db]">
                BAI <span className="text-[#f5a623]">&</span> SIL
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/categories"
                className="text-sm font-medium text-gray-700 hover:text-[#1a56db] transition-colors"
              >
                Categories
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db]"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {user?.role === "seller" && (
              <Link
                href="/sell"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-[#f5a623] text-white text-sm font-medium rounded-lg hover:bg-yellow-500 transition-colors"
              >
                <IoAddCircle className="w-4 h-4" />
                Sell
              </Link>
            )}
            {user && (user.isAdmin || user.role === "admin") && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Admin
              </Link>
            )}

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/messages"
                  className="relative p-2 text-gray-600 hover:text-[#1a56db] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiMessageSquare className="w-5 h-5" />
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2"
                  >
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <span className="hidden md:inline text-sm font-medium text-gray-700">{user.name}</span>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                          user.role === "seller" ? "bg-yellow-100 text-yellow-800" :
                          user.isAdmin || user.role === "admin" ? "bg-red-100 text-red-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {user.role || "buyer"}
                        </span>
                      </div>
                      <Link
                        href="/profile/me"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href={getDashboardLink()}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        {getDashboardLabel()}
                      </Link>
                      <Link
                        href="/messages"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Messages
                      </Link>
                      {user.role === "seller" && (
                        <Link
                          href="/my-listings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          My Listings
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-[#e8634a] hover:bg-gray-50"
                        >
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
                  className="px-4 py-2 text-sm font-medium text-[#1a56db] border border-[#1a56db] rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1a56db] rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db]"
              />
            </div>
          </form>
          <div className="px-4 pb-4 space-y-2">
            {user?.role === "seller" && (
              <Link
                href="/sell"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#f5a623] text-white font-medium rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <IoAddCircle className="w-5 h-5" />
                Sell Item
              </Link>
            )}
            {user && (user.isAdmin || user.role === "admin") && (
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white font-medium rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/categories"
              className="block py-2 text-sm text-gray-700 hover:text-[#1a56db]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            {user && (
              <Link
                href="/messages"
                className="block py-2 text-sm text-gray-700 hover:text-[#1a56db]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
              </Link>
            )}
            {!user && (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-sm text-gray-700 hover:text-[#1a56db]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block py-2 text-sm text-gray-700 hover:text-[#1a56db]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
            {user && (
              <>
                <Link
                  href="/profile/me"
                  className="block py-2 text-sm text-gray-700 hover:text-[#1a56db]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href={getDashboardLink()}
                  className="block py-2 text-sm text-gray-700 hover:text-[#1a56db]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {getDashboardLabel()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-sm text-[#e8634a]"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
