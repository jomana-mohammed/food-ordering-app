"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutPageProps {
  params: { locale: string };
}

const checkoutSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  phone: z.string().min(7, "Valid phone number is required"),
  paymentMethod: z.enum(["online", "cash"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function StripeCardForm({
  onSubmit,
  isLoading,
  t,
}: {
  onSubmit: (paymentIntentId: string) => void;
  isLoading: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { getTotalPrice } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);

    try {
      const amount = getTotalPrice();
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "usd" }),
      });

      const { data, success, error } = await res.json();
      if (!success) {
        toast.error(error || "Payment initialization failed");
        setIsProcessing(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setIsProcessing(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (stripeError) {
        toast.error(stripeError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSubmit(paymentIntent.id);
      }
    } catch {
      toast.error("Payment processing failed");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <CardElement
          options={{
            style: {
              base: {
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                "::placeholder": { color: "rgba(255,255,255,0.3)" },
              },
              invalid: { color: "#ef4444" },
            },
          }}
        />
      </div>
      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || isProcessing || isLoading}
        id="pay-with-stripe-btn"
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("processing")}
          </>
        ) : (
          <>
            🔒 {t("placeOrder")}
          </>
        )}
      </button>
    </div>
  );
}

export default function CheckoutPage({ params: { locale } }: CheckoutPageProps) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "online" },
  });

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
    }
  }, [user, locale, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}`);
    }
  }, [items, locale, router]);

  const placeOrder = async (
    formData: CheckoutFormData,
    stripePaymentIntentId?: string
  ) => {
    setIsLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          paymentMethod: formData.paymentMethod,
          deliveryAddress: {
            street: formData.street,
            city: formData.city,
            phone: formData.phone,
          },
          ...(stripePaymentIntentId && { stripePaymentIntentId }),
        }),
      });

      const result = await res.json();

      if (result.success) {
        clearCart();
        toast.success("Order placed successfully! 🎉");
        router.push(
          `/${locale}/orders/confirmation?orderId=${result.data.order._id}`
        );
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onCODSubmit = async (formData: CheckoutFormData) => {
    await placeOrder({ ...formData, paymentMethod: "cash" });
  };

  const onStripeSuccess = async (paymentIntentId: string) => {
    const formData = {
      street: (document.getElementById("checkout-street") as HTMLInputElement)?.value || "",
      city: (document.getElementById("checkout-city") as HTMLInputElement)?.value || "",
      phone: (document.getElementById("checkout-phone") as HTMLInputElement)?.value || "",
      paymentMethod: "online" as const,
    };
    await placeOrder(formData, paymentIntentId);
  };

  const total = getTotalPrice();

  if (!user || items.length === 0) return null;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white">{t("title")}</h1>
          <p className="text-white/40 mt-2">Complete your order</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400">📍</span>
                {t("deliveryAddress")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">{t("street")}</label>
                  <input
                    {...register("street")}
                    type="text"
                    placeholder={t("streetPlaceholder")}
                    className="input-field"
                    id="checkout-street"
                  />
                  {errors.street && (
                    <p className="text-red-400 text-xs mt-1">{errors.street.message}</p>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">{t("city")}</label>
                    <input
                      {...register("city")}
                      type="text"
                      placeholder={t("cityPlaceholder")}
                      className="input-field"
                      id="checkout-city"
                    />
                    {errors.city && (
                      <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">{t("phone")}</label>
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder={t("phonePlaceholder")}
                      className="input-field"
                      id="checkout-phone"
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400">💳</span>
                {t("paymentMethod")}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  id="payment-online-btn"
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === "online"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-semibold text-white text-sm">{t("payOnline")}</div>
                  <div className="text-white/40 text-xs mt-1">Secure Stripe payment</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  id="payment-cash-btn"
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === "cash"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-2xl mb-2">💵</div>
                  <div className="font-semibold text-white text-sm">{t("cashOnDelivery")}</div>
                  <div className="text-white/40 text-xs mt-1">Pay when delivered</div>
                </button>
              </div>

              {/* Payment content */}
              {paymentMethod === "online" ? (
                <Elements stripe={stripePromise}>
                  <StripeCardForm
                    onSubmit={onStripeSuccess}
                    isLoading={isLoading}
                    t={t}
                  />
                </Elements>
              ) : (
                <form onSubmit={handleSubmit(onCODSubmit)}>
                  <input
                    type="hidden"
                    {...register("paymentMethod")}
                    value="cash"
                  />
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                    <p className="text-yellow-300 text-sm">
                      💡 Please have the exact amount of{" "}
                      <strong>${total.toFixed(2)}</strong> ready when the
                      delivery arrives.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    id="place-cod-order-btn"
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t("processing")}
                      </>
                    ) : (
                      `${t("placeOrder")} - $${total.toFixed(2)}`
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-20">
              <h2 className="text-lg font-bold text-white mb-5">{t("orderSummary")}</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={locale === "ar" ? item.name.ar : item.name.en}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {locale === "ar" ? item.name.ar : item.name.en}
                      </p>
                      <p className="text-white/40 text-xs">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-orange-400 font-bold text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 mt-4 pt-4">
                <div className="flex justify-between text-white/60 text-sm mb-2">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm mb-2">
                  <span>Delivery Fee</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl mt-3 pt-3 border-t border-white/10">
                  <span>{t("orderSummary").split(" ")[0]} Total</span>
                  <span className="gradient-text">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
