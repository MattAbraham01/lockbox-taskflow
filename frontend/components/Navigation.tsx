"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { EnglishConnectButton } from "./EnglishConnectButton";

const navItems = [
  { href: "/", label: "Activities", icon: "🏃", description: "Record workout data" },
  { href: "/dashboard", label: "Dashboard", icon: "📊", description: "Data overview" },
  { href: "/statistics", label: "Statistics", icon: "📈", description: "Deep analysis" },
];

export const Navigation = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-purple-500/40"
          : "bg-gray-900/80 backdrop-blur-md border-b border-purple-500/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-purple-500/50">
                🏃
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-1 hidden sm:block">
              <h1 className="text-xl font-bold text-white transition-colors group-hover:text-purple-300">
                Fitness Tracker
              </h1>
              <p className="text-xs text-purple-400 transition-colors group-hover:text-pink-400">
                FHEVM Encrypted
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-2xl p-1.5 backdrop-blur-sm border border-purple-500/20">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    relative px-3 sm:px-5 py-2.5 rounded-xl font-medium text-sm
                    transition-all duration-300 transform
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-300 hover:text-white"
                    }
                    ${!isActive && isHovered ? "bg-gray-700/50" : ""}
                    hover:scale-105 active:scale-95
                  `}
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <span className={`text-lg transition-transform duration-300 ${isHovered ? "scale-125" : ""}`}>
                      {item.icon}
                    </span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full opacity-80" />
                  )}
                  
                  {/* Hover tooltip */}
                  {isHovered && !isActive && (
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-purple-300 whitespace-nowrap bg-gray-900/90 px-2 py-1 rounded-md border border-purple-500/30 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
                      {item.description}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Wallet Connect Button */}
          <div className="hidden md:block">
            <EnglishConnectButton />
          </div>
        </div>
      </div>
      
      {/* Gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </nav>
  );
};





