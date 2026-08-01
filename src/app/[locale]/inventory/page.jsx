"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { inventoryService } from "@/features/inventory/services/inventoryService";
import {
  Package,
  ShoppingCart,
  Filter,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

/* ── small helper badge ───────────────────────────────────────────── */
function StockBadge({ qty, reorder }) {
  const t = useTranslations("inventory");
  const num = parseFloat(qty ?? 0);
  const reorderNum = parseFloat(reorder ?? 0);
  if (num <= 0) return <Badge variant="danger">{t("outOfStock")}</Badge>;
  if (num <= reorderNum) return <Badge variant="warning">{t("lowStock")}</Badge>;
  return <Badge variant="success">{t("inStock")}</Badge>;
}

function PurchaseStatusBadge({ status }) {
  const t = useTranslations("inventory");
  const map = {
    pending: { variant: "info", icon: Clock },
    received: { variant: "success", icon: CheckCircle2 },
    cancelled: { variant: "neutral", icon: XCircle },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <Badge variant={s.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {t(status)}
    </Badge>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function InventoryPage() {
  const t = useTranslations("inventory");

  const [activeTab, setActiveTab] = useState("items");
  const [loading, setLoading] = useState(true);

  // Items state
  const [items, setItems] = useState([]);
  const [itemsMeta, setItemsMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [itemPage, setItemPage] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [itemSearch, setItemSearch] = useState("");

  // Purchases state
  const [purchases, setPurchases] = useState([]);
  const [purchasesMeta, setPurchasesMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState("");

  /* fetch data */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getItems({
        page: itemPage,
        per_page: 12,
        name: itemSearch,
        low_stock: lowStockOnly,
      });
      setItems(res.data || []);
      setItemsMeta(res.meta || { current_page: itemPage, last_page: 1, total: (res.data || []).length });
    } catch (err) {
      console.error("Failed to load inventory items:", err);
      setItems([]);
      setItemsMeta({ current_page: 1, last_page: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [itemPage, itemSearch, lowStockOnly]);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getPurchases({
        page: purchasePage,
        per_page: 12,
        status: purchaseStatus,
      });
      setPurchases(res.data || []);
      setPurchasesMeta(res.meta || { current_page: purchasePage, last_page: 1, total: (res.data || []).length });
    } catch (err) {
      console.error("Failed to load purchases:", err);
      setPurchases([]);
      setPurchasesMeta({ current_page: 1, last_page: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [purchasePage, purchaseStatus]);

  useEffect(() => {
    if (activeTab === "items") fetchItems();
    else fetchPurchases();
  }, [activeTab, fetchItems, fetchPurchases]);

  const handleReceive = async (purchaseId) => {
    try {
      await inventoryService.receivePurchase(purchaseId);
      fetchPurchases();
    } catch (err) {
      console.error("Receive failed:", err);
    }
  };

  const handleCancel = async (purchaseId) => {
    if (!confirm("Cancel this purchase order?")) return;
    try {
      await inventoryService.cancelPurchase(purchaseId);
      fetchPurchases();
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  /* KPIs */
  const lowStockCount = items.filter((i) => {
    const s = i.stocks?.[0];
    return s && parseFloat(s.quantity_on_hand) <= parseFloat(s.reorder_level) && parseFloat(s.quantity_on_hand) > 0;
  }).length;
  const outOfStockCount = items.filter((i) => parseFloat(i.stocks?.[0]?.quantity_on_hand ?? 0) <= 0).length;
  const pendingPurchases = purchases.filter((p) => p.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{t("subtitle")}</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: itemsMeta.total || items.length, icon: Package, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Low Stock Alerts", value: lowStockCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Out of Stock", value: outOfStockCount, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Pending Orders", value: pendingPurchases, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((kpi) => (
            <Card key={kpi.label} className="p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{kpi.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {["items", "purchases"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-teal-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "items" ? t("items") : t("purchases")}
            </button>
          ))}
        </div>

        {/* ── ITEMS TAB ─────────────────────────────────────── */}
        {activeTab === "items" && (
          <Card className="shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={itemSearch}
                  onChange={(e) => { setItemSearch(e.target.value); setItemPage(1); }}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-amber-700">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => { setLowStockOnly(e.target.checked); setItemPage(1); }}
                  className="accent-amber-500"
                />
                {t("filterLowStock")}
              </label>
            </div>

            {loading ? (
              <div className="py-14 flex justify-center"><Spinner size="lg" /></div>
            ) : items.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-3 stroke-1" />
                <p className="font-semibold">No inventory items found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-3 text-start">{t("itemName")}</th>
                      <th className="px-5 py-3 text-start">{t("code")}</th>
                      <th className="px-5 py-3 text-end">{t("stock")}</th>
                      <th className="px-5 py-3 text-end">{t("reorderLevel")}</th>
                      <th className="px-5 py-3 text-start">{t("unit")}</th>
                      <th className="px-5 py-3 text-start">{t("stockStatus")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const stock = item.stocks?.[0] || {};
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3.5 font-bold text-slate-900">{item.name}</td>
                          <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{item.code || "—"}</td>
                          <td className="px-5 py-3.5 text-end font-mono font-bold text-slate-800">
                            {stock.quantity_on_hand ?? "—"}
                          </td>
                          <td className="px-5 py-3.5 text-end font-mono text-slate-500">
                            {stock.reorder_level ?? "—"}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 capitalize">{item.unit || "unit"}</td>
                          <td className="px-5 py-3.5">
                            <StockBadge qty={stock.quantity_on_hand} reorder={stock.reorder_level} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {itemsMeta.last_page > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                <p className="text-xs text-slate-500">Page {itemsMeta.current_page} of {itemsMeta.last_page}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={itemPage <= 1} onClick={() => setItemPage((p) => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" disabled={itemPage >= itemsMeta.last_page} onClick={() => setItemPage((p) => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── PURCHASES TAB ─────────────────────────────────── */}
        {activeTab === "purchases" && (
          <Card className="shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={purchaseStatus}
                onChange={(e) => { setPurchaseStatus(e.target.value); setPurchasePage(1); }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">{t("pending")}</option>
                <option value="received">{t("received")}</option>
                <option value="cancelled">{t("cancelled")}</option>
              </select>
            </div>

            {loading ? (
              <div className="py-14 flex justify-center"><Spinner size="lg" /></div>
            ) : purchases.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 stroke-1" />
                <p className="font-semibold">No purchase orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-3 text-start">Order #</th>
                      <th className="px-5 py-3 text-start">{t("supplier")}</th>
                      <th className="px-5 py-3 text-start">{t("branch")}</th>
                      <th className="px-5 py-3 text-start">{t("purchaseDate")}</th>
                      <th className="px-5 py-3 text-end">{t("totalCost")}</th>
                      <th className="px-5 py-3 text-start">{t("status")}</th>
                      <th className="px-5 py-3 text-end">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-teal-700">
                          #{po.id}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {po.supplier?.name || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {po.branch?.name || "—"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          {po.created_at?.split("T")[0] || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-end font-mono font-bold text-slate-800">
                          ${parseFloat(po.total_cost || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5">
                          <PurchaseStatusBadge status={po.status} />
                        </td>
                        <td className="px-5 py-3.5 text-end">
                          <div className="flex items-center justify-end gap-2">
                            {po.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleReceive(po.id)}
                                >
                                  {t("receivePurchase")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleCancel(po.id)}
                                >
                                  {t("cancelPurchase")}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {purchasesMeta.last_page > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                <p className="text-xs text-slate-500">Page {purchasesMeta.current_page} of {purchasesMeta.last_page}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={purchasePage <= 1} onClick={() => setPurchasePage((p) => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" disabled={purchasePage >= purchasesMeta.last_page} onClick={() => setPurchasePage((p) => p + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
