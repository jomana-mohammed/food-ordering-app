import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/models/Order";

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const t = useTranslations("orders.status");

  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border badge-${status} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {t(status as Parameters<typeof t>[0])}
    </span>
  );
}
