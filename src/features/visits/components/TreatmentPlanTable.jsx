"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus, DollarSign } from "lucide-react";

function formatText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.en || val.ar || Object.values(val).find((v) => typeof v === "string") || "";
  }
  return String(val);
}

export function TreatmentPlanTable({ services = [], onAddService, onRemoveService, readOnly = false }) {
  const t = useTranslations("visits");

  const [showAddForm, setShowAddForm] = useState(false);
  const [serviceName, setServiceName] = useState("Root Canal Treatment");
  const [toothNum, setToothNum] = useState("14");
  const [price, setPrice] = useState(150);
  const [qty, setQty] = useState(1);
  const [discount, setDiscount] = useState(0);

  const calculateTotal = () => {
    return services.reduce((acc, item) => {
      const itemPrice = parseFloat(item.unit_price || item.price || 0);
      const itemQty = parseInt(item.quantity || item.qty || 1, 10);
      const itemDisc = parseFloat(item.discount_amount || item.discount || 0);
      return acc + (itemPrice * itemQty - itemDisc);
    }, 0);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!serviceName) return;

    onAddService?.({
      service_id: 1, // Default service_id for recording treatment
      service_name: serviceName,
      tooth_number: toothNum ? parseInt(toothNum, 10) : null,
      unit_price: parseFloat(price),
      quantity: parseInt(qty, 10),
      discount_amount: parseFloat(discount),
    });

    setShowAddForm(false);
  };

  return (
    <Card className="p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{t("treatmentPlan")}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Dental treatments and services provided in this examination.
          </p>
        </div>

        {!readOnly && (
          <Button size="sm" variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 me-1" />
            <span>{t("addService")}</span>
          </Button>
        )}
      </div>

      {/* Inline Form to Add Treatment Service */}
      {showAddForm && !readOnly && (
        <form onSubmit={handleAddSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("serviceName")}
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("toothNumber")}
              </label>
              <input
                type="text"
                value={toothNum}
                onChange={(e) => setToothNum(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                placeholder="e.g. 14"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("price")} ($)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("qty")}
              </label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Add Item
            </Button>
          </div>
        </form>
      )}

      {/* Services Table */}
      {services.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No services added to this treatment plan yet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="px-4 py-3 text-start">{t("serviceName")}</th>
                <th className="px-4 py-3 text-start">{t("toothNumber")}</th>
                <th className="px-4 py-3 text-end">{t("price")}</th>
                <th className="px-4 py-3 text-end">{t("qty")}</th>
                <th className="px-4 py-3 text-end">{t("total")}</th>
                {!readOnly && <th className="px-4 py-3 text-end">{t("actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((item, idx) => {
                const itemPrice = parseFloat(item.unit_price || item.price || 0);
                const itemQty = parseInt(item.quantity || item.qty || 1, 10);
                const itemDisc = parseFloat(item.discount_amount || item.discount || 0);
                const itemTotal = parseFloat(item.total || (itemPrice * itemQty - itemDisc));

                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatText(item.service?.name) || formatText(item.service_name) || "Dental Service"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {item.tooth_number || item.tooth_id || "All"}
                    </td>
                    <td className="px-4 py-3 text-end font-mono">${itemPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-end font-mono">{itemQty}</td>
                    <td className="px-4 py-3 text-end font-mono font-bold text-teal-700">
                      ${itemTotal.toFixed(2)}
                    </td>
                    {!readOnly && (
                      <td className="px-4 py-3 text-end">
                        <button
                          onClick={() => onRemoveService?.(item.id || idx)}
                          className="p-1 rounded text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-teal-50/60 font-bold border-t border-teal-100">
                <td colSpan={4} className="px-4 py-3 text-end text-teal-900">
                  {t("total")}:
                </td>
                <td className="px-4 py-3 text-end text-teal-700 font-mono text-base">
                  ${calculateTotal().toFixed(2)}
                </td>
                {!readOnly && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}
