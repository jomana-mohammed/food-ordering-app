"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { toggleCart, getTotalItems } = useCartStore();
  const { user, logout } = useAuthStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push(`/${locale}`);
    setMobileMenuOpen(false);
  };

  const getLocalizedPath = (targetLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = targetLocale;
    return segments.join("/");
  };

  const otherLocale = locale === "en" ? "ar" : "en";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
              🍔
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:block">
              {tCommon("appName")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              {t("home")}
            </Link>
            {user && (
              <Link
                href={`/${locale}/orders`}
                className="text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                {t("orders")}
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href={`/${locale}/admin`}
                className="text-orange-400 hover:text-orange-300 transition-colors text-sm font-medium"
              >
                {t("admin")}
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Link
              href={getLocalizedPath(otherLocale)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm font-medium border border-white/10"
            >
              <span className="text-base">{locale === "en" ? "🇸🇦" : "🇺🇸"}</span>
              <span className="text-white/80">{t("language")}</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl glass hover:bg-white/10 transition-all group"
              aria-label="Open cart"
              id="cart-toggle-btn"
            >
              <svg
                className="w-5 h-5 text-white/80 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-subtle">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  id="logout-btn"
                  className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-red-500/20"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href={`/${locale}/login`}
                  className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white transition-all"
                >
                  {t("login")}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="btn-primary !px-4 !py-1.5 !text-sm"
                >
                  {t("register")}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl glass"
              aria-label="Toggle mobile menu"
              id="mobile-menu-btn"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-2 animate-fade-in bg-[#0f0f0f] rounded-b-2xl shadow-2xl shadow-black/50 px-2">
            <Link
              href={`/${locale}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {t("home")}
            </Link>
            {user && (
              <Link
                href={`/${locale}/orders`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {t("orders")}
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href={`/${locale}/admin`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/5 rounded-lg transition-all"
              >
                {t("admin")}
              </Link>
            )}
            <Link
              href={getLocalizedPath(otherLocale)}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              {t("language")}
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                {t("logout")}
              </button>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg glass text-sm text-white/70 hover:text-white transition-all"
                >
                  {t("login")}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
