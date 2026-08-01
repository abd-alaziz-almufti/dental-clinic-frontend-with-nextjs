import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";

export function InvoiceStatusBadge({ status = "unpaid" }) {
  const t = useTranslations("billing");

  const normalized = (status || "unpaid").toLowerCase();

  const variantMap = {
    paid: "success",
    partial: "warning",
    partially_paid: "warning",
    issued: "info",
    draft: "neutral",
    unpaid: "info",
    pending: "info",
    overdue: "danger",
    cancelled: "neutral",
  };

  const labelKeyMap = {
    paid: "paid",
    partial: "partial",
    partially_paid: "partial",
    issued: "issued",
    draft: "draft",
    unpaid: "unpaid",
    pending: "unpaid",
    overdue: "overdue",
    cancelled: "cancelled",
  };

  const translationKey = labelKeyMap[normalized] || normalized;

  let displayLabel = status;
  try {
    displayLabel = t(translationKey);
  } catch {
    displayLabel = status;
  }

  return (
    <Badge variant={variantMap[normalized] || "neutral"}>
      {displayLabel || status}
    </Badge>
  );
}
