"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiSearch, FiMessageSquare, FiUser } from "react-icons/fi";
import { IoAddCircle } from "react-icons/io5";

const navItems = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/categories", label: "Explore", icon: FiSearch },
  { href: "/sell", label: "Sell", icon: IoAddCircle, emphasized: true },
  { href: "/messages", label: "Messages", icon: FiMessageSquare },
  { href: "/profile/me", label: "Profile", icon: FiUser },
];

const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.emphasized) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-14 h-14 rounded-full bg-[#f5a623] flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-medium text-[#f5a623] mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 min-w-[64px] ${
                isActive ? "text-[#1a56db]" : "text-gray-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
