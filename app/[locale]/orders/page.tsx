"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuthStore } from "@/store/authStore";
import StatusStepper from "@/components/StatusStepper";
import StatusBadge from "@/components/StatusBadge";
import { OrderCardSkeleton } from "@/components/LoadingSkeleton";
import type { OrderStatus } from "@/lib/models/Order";

interface Order {
  _id: string;
  items: Array<{
    name: { en: string; ar: string };
    quantity: number;
    priceAtOrder: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "online" | "cash";
  paymentStatus: "paid" | "unpaid";
  deliveryAddress: {
    street: string;
    city: string;
    phone: string;
  };
  createdAt: string;
}


export default function OrdersPage() {
  const locale = useLocale();
  const t = useTranslations("orders");
  const tPayment = useTranslations("orders.payment");
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading, locale, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/orders/my");
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.orders);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  if (authLoading || (!user && !authLoading)) return null;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white">{t("title")}</h1>
          <p className="text-white/40 mt-2">
            {locale === "ar" ? "تتبع جميع طلباتك" : "Track all your orders"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-white mb-3">{t("empty")}</h3>
            <p className="text-white/40 max-w-md mb-8">{t("emptyHint")}</p>
            <Link href={`/${locale}`} className="btn-primary" id="start-ordering-btn">
              {locale === "ar" ? "ابدأ الطلب" : "Start Ordering"} →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id;

              return (
                <div
                  key={order._id}
                  className="glass rounded-2xl overflow-hidden border border-white/10 animate-fade-in"
                  id={`order-${order._id}`}
                >
                  {/* Order Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order._id)
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-white/40 text-xs font-medium mb-1">
                          ORDER #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-white/60 text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={order.status} />
                        <div
                          className={`text-xs px-3 py-1 rounded-full border font-medium ${
                            order.paymentStatus === "paid"
                              ? "badge-delivered"
                              : "badge-pending"
                          }`}
                        >
                          {order.paymentStatus === "paid"
                            ? tPayment("paid")
                            : tPayment("unpaid")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span>
                          {order.items.length} {t("items", { count: order.items.length })}
                        </span>
                        <span>•</span>
                        <span>
                          {order.paymentMethod === "online"
                            ? tPayment("online")
                            : tPayment("cash")}
                        </span>
                      </div>
                      <span className="text-orange-400 font-black text-xl">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-white/10 pt-5 space-y-5 animate-fade-in">
                      {/* Progress Stepper */}
                      <div>
                        <p className="text-white/40 text-xs font-medium mb-3">
                          {t("orderStatus")}
                        </p>
                        <StatusStepper status={order.status} />
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-white/40 text-xs font-medium mb-3">
                          ORDER ITEMS
                        </p>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between text-sm py-2 border-b border-white/5 last:border-0"
                            >
                              <span className="text-white/70">
                                {locale === "ar" ? item.name.ar : item.name.en}{" "}
                                <span className="text-white/30">
                                  × {item.quantity}
                                </span>
                              </span>
                              <span className="text-white font-medium">
                                ${(item.priceAtOrder * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <p className="text-white/40 text-xs font-medium mb-2">
                          DELIVERY ADDRESS
                        </p>
                        <div className="bg-white/5 rounded-xl p-3 text-sm text-white/60">
                          <p>{order.deliveryAddress.street}</p>
                          <p>{order.deliveryAddress.city}</p>
                          <p>{order.deliveryAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
