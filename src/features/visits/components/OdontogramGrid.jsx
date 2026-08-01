"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function OdontogramGrid({ teeth = [], onToothConditionChange, readOnly = false }) {
  const t = useTranslations("visits");

  // Upper jaw: 1 - 16, Lower jaw: 17 - 32
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => i + 17);

  const [selectedTooth, setSelectedTooth] = useState(null);

  // Map tooth id/number to its condition entry
  const toothConditionMap = {};
  teeth.forEach((item) => {
    const num = item.tooth_number || item.tooth_id || item.tooth?.number;
    if (num) {
      const cond = (item.condition_code || item.condition || item.status || "decay").toLowerCase();
      toothConditionMap[num] = cond;
    }
  });

  const conditionColors = {
    healthy: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
    decay: "bg-red-500 text-white border-red-600 shadow-sm",
    filled: "bg-blue-600 text-white border-blue-700 shadow-sm",
    missing: "bg-slate-300 text-slate-500 border-slate-400 opacity-60",
    crown: "bg-purple-600 text-white border-purple-700 shadow-sm",
  };

  const handleConditionSelect = (condition) => {
    if (selectedTooth && !readOnly) {
      onToothConditionChange?.(selectedTooth, condition);
      setSelectedTooth(null);
    }
  };

  return (
    <Card className="p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{t("odontogram")}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Click any tooth to record or update clinical condition.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300" />
            <span>{t("healthy")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>{t("decay")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span>{t("filled")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-purple-600" />
            <span>{t("crown")}</span>
          </div>
        </div>
      </div>

      {/* Dental Chart Rows */}
      <div className="space-y-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 overflow-x-auto">
        {/* Upper Jaw (1 - 16) */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t("upperJaw")}
          </p>
          <div className="flex items-center justify-between gap-1.5 min-w-[640px]">
            {upperTeeth.map((num) => {
              const condition = toothConditionMap[num] || "healthy";
              const isSelected = selectedTooth === num;

              return (
                <button
                  key={num}
                  disabled={readOnly}
                  onClick={() => setSelectedTooth(num)}
                  className={`flex-1 h-12 rounded-lg border flex flex-col items-center justify-center font-bold text-xs transition-all ${
                    conditionColors[condition] || conditionColors.healthy
                  } ${isSelected ? "ring-2 ring-teal-500 ring-offset-2 scale-105" : ""}`}
                >
                  <span className="text-[10px] opacity-75">#{num}</span>
                  <span className="capitalize text-[9px] truncate max-w-full px-0.5">
                    {condition.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lower Jaw (17 - 32) */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t("lowerJaw")}
          </p>
          <div className="flex items-center justify-between gap-1.5 min-w-[640px]">
            {lowerTeeth.map((num) => {
              const condition = toothConditionMap[num] || "healthy";
              const isSelected = selectedTooth === num;

              return (
                <button
                  key={num}
                  disabled={readOnly}
                  onClick={() => setSelectedTooth(num)}
                  className={`flex-1 h-12 rounded-lg border flex flex-col items-center justify-center font-bold text-xs transition-all ${
                    conditionColors[condition] || conditionColors.healthy
                  } ${isSelected ? "ring-2 ring-teal-500 ring-offset-2 scale-105" : ""}`}
                >
                  <span className="text-[10px] opacity-75">#{num}</span>
                  <span className="capitalize text-[9px] truncate max-w-full px-0.5">
                    {condition.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Tooth Action Bar */}
      {selectedTooth && !readOnly && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between animate-in fade-in duration-150">
          <p className="text-sm font-bold text-teal-900">
            Selected Tooth: <span className="underline">#{selectedTooth}</span>
          </p>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleConditionSelect("healthy")}>
              {t("healthy")}
            </Button>
            <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleConditionSelect("decay")}>
              {t("decay")}
            </Button>
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleConditionSelect("filled")}>
              {t("filled")}
            </Button>
            <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => handleConditionSelect("crown")}>
              {t("crown")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedTooth(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
