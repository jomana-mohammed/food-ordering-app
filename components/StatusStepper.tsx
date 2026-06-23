"use client";

import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/models/Order";

interface StatusStepperProps {
  status: OrderStatus;
}

const steps: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "pending", label: "Pending", icon: "⏳" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "out_for_delivery", label: "On the Way", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

const statusOrder: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

export default function StatusStepper({ status }: StatusStepperProps) {
  const t = useTranslations("orders.status");
  const currentStep = statusOrder[status] ?? 0;
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-sm">❌</span>
        </div>
        <span className="text-red-400 font-medium">{t("cancelled")}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                    isCompleted
                      ? "bg-green-500 shadow-lg shadow-green-500/30"
                      : isCurrent
                      ? "bg-orange-500 shadow-lg shadow-orange-500/30 animate-pulse"
                      : "bg-white/10"
                  }`}
                >
                  {isCompleted ? "✓" : step.icon}
                </div>
                <span
                  className={`text-[10px] font-medium text-center leading-tight max-w-[60px] ${
                    isCompleted
                      ? "text-green-400"
                      : isCurrent
                      ? "text-orange-400"
                      : "text-white/30"
                  }`}
                >
                  {t(step.key as Parameters<typeof t>[0])}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-1 transition-all ${
                    isCompleted ? "bg-green-500" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
