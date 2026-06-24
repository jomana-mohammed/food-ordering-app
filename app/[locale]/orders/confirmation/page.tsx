"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

interface Order {
  _id: string;
  items: Array<{
    name: { en: string; ar: string };
    quantity: number;
    priceAtOrder: number;
  }>;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  deliveryAddress: {
    street: string;
    city: string;
    phone: string;
  };
  createdAt: string;
}


export default function ConfirmationPage() {
  const locale = useLocale();
  const t = useTranslations("confirmation");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        const res = await fetch("/api/orders/my");
        const data = await res.json();
        if (data.success) {
          const found = data.data.orders.find((o: Order) => o._id === orderId);
          setOrder(found || null);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="max-w-lg w-full text-center animate-fade-in">
        {/* Success animation */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl shadow-green-500/30">
          🎉
        </div>

        <h1 className="text-4xl font-black text-white mb-3">{t("title")}</h1>
        <p className="text-white/60 text-lg mb-8">{t("subtitle")}</p>

        {orderId && (
          <div className="glass rounded-2xl p-6 mb-8">
            <p className="text-white/50 text-sm mb-1">{t("orderNumber")}</p>
            <p className="text-orange-400 font-mono font-bold text-lg">
              #{orderId.slice(-8).toUpperCase()}
            </p>
            {order && (
              <div className="mt-4 pt-4 border-t border-white/10 text-left space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/70">
                      {locale === "ar" ? item.name.ar : item.name.en} × {item.quantity}
                    </span>
                    <span className="text-white">
                      ${(item.priceAtOrder * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-orange-400">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-white/40 text-sm mb-8">
          {t(
            (order?.paymentMethod === "cash" ? "cashNote" : "paymentNote") as Parameters<typeof t>[0]
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/orders`}
            className="btn-primary"
            id="track-order-btn"
          >
            {t("trackOrder")} →
          </Link>
          <Link
            href={`/${locale}`}
            className="btn-secondary"
            id="continue-shopping-btn"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}
