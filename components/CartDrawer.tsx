"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface CartDrawerProps {
  locale: string;
}

export default function CartDrawer({ locale }: CartDrawerProps) {
  const t = useTranslations("cart");
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalPrice,
  } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === "ar";

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [closeCart]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleRemove = (productId: string, name: string) => {
    removeItem(productId);
    toast.error(`${name} removed from cart`);
  };

  const subtotal = getTotalPrice();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 drawer-overlay"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 ${
          isRTL ? "left-0 animate-slide-in-left" : "right-0 animate-slide-in-right"
        } h-full w-full max-w-md bg-[#111] border-${
          isRTL ? "r" : "l"
        } border-white/10 z-50 flex flex-col shadow-2xl`}
        role="dialog"
        aria-label={t("title")}
        id="cart-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-orange-400"
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
            </div>
            <h2 className="text-lg font-bold text-white">{t("title")}</h2>
            {items.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-lg glass hover:bg-white/10 transition-all text-white/60 hover:text-white"
            aria-label="Close cart"
            id="close-cart-btn"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-white/60 font-medium text-lg">{t("empty")}</p>
              <p className="text-white/30 text-sm mt-1">{t("emptyHint")}</p>
              <button
                onClick={closeCart}
                className="mt-6 btn-primary"
              >
                {t("continueShopping")}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="glass rounded-xl p-4 flex gap-4 animate-fade-in"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                  <img
                    src={item.image}
                    alt={locale === "ar" ? item.name.ar : item.name.en}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-food.jpg";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {locale === "ar" ? item.name.ar : item.name.en}
                  </p>
                  <p className="text-orange-400 font-bold text-sm mt-0.5">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-white font-bold text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        aria-label="Increase quantity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        handleRemove(
                          item.productId,
                          locale === "ar" ? item.name.ar : item.name.en
                        )
                      }
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60 font-medium">{t("subtotal")}</span>
              <span className="text-white font-bold text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <Link
              href={`/${locale}/checkout`}
              onClick={closeCart}
              className="btn-primary w-full text-center block"
              id="checkout-btn"
            >
              {t("checkout")} →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
