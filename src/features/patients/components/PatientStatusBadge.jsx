import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";

export function PatientStatusBadge({ status = "cleared" }) {
  const t = useTranslations("patients");

  const normalized = status.toLowerCase();

  const variantMap = {
    cleared: "success",
    pending: "warning",
    overdue: "danger",
  };

  const labelMap = {
    cleared: t("cleared"),
    pending: t("pending"),
    overdue: t("overdue"),
  };

  return (
    <Badge variant={variantMap[normalized] || "neutral"}>
      {labelMap[normalized] || status}
    </Badge>
  );
}
