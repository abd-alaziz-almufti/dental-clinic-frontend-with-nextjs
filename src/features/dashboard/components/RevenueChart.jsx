"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";

export function RevenueChart() {
  const t = useTranslations("dashboard");
  const [period, setPeriod] = useState("weekly");

  // Sample static bar data representing weekly clinic revenue
  const weeklyData = [
    { label: "Mon", value: 65, amount: "$1,300" },
    { label: "Tue", value: 80, amount: "$1,600" },
    { label: "Wed", value: 45, amount: "$900" },
    { label: "Thu", value: 95, amount: "$1,900" },
    { label: "Fri", value: 75, amount: "$1,500" },
    { label: "Sat", value: 30, amount: "$600" },
    { label: "Sun", value: 0, amount: "$0" },
  ];

  return (
    <Card className="p-5 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {t("revenueOverview")}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Weekly revenue performance
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setPeriod("weekly")}
            className={`px-3 py-1 rounded-md transition-all ${
              period === "weekly"
                ? "bg-white text-teal-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t("weekly")}
          </button>
          <button
            onClick={() => setPeriod("monthly")}
            className={`px-3 py-1 rounded-md transition-all ${
              period === "monthly"
                ? "bg-white text-teal-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t("monthly")}
          </button>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
        {weeklyData.map((item) => (
          <div
            key={item.label}
            className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
          >
            {/* Tooltip on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none mb-1">
              {item.amount}
            </div>

            {/* Bar */}
            <div
              style={{ height: `${item.value}%` }}
              className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                item.value > 0
                  ? "bg-teal-600 group-hover:bg-teal-500"
                  : "bg-slate-100"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Day Labels */}
      <div className="flex items-center justify-between gap-2 px-2 mt-3">
        {weeklyData.map((item) => (
          <div
            key={item.label}
            className="flex-1 text-center text-xs font-semibold text-slate-500"
          >
            {item.label}
          </div>
        ))}
      </div>
    </Card>
  );
}
