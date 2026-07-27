import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";

export function InvoiceStatusBadge({ status = "unpaid" }) {
  const t = useTranslations("billing");

  const normalized = status.toLowerCase();

  const variantMap = {
    paid: "success",
    partial: "warning",
    partially_paid: "warning",
    unpaid: "info",
    pending: "info",
    overdue: "danger",
    cancelled: "neutral",
  };

  const labelKeyMap = {
    paid: "paid",
    partial: "partial",
    partially_paid: "partial",
    unpaid: "unpaid",
    pending: "unpaid",
    overdue: "overdue",
    cancelled: "cancelled",
  };

  return (
    <Badge variant={variantMap[normalized] || "neutral"}>
      {t(labelKeyMap[normalized] || normalized) || status}
    </Badge>
  );
}
