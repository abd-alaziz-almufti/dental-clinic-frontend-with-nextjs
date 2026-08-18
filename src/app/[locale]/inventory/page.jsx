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
  Plus,
  X,
} from "lucide-react";

/* ── Stock badge ──────────────────────────────────────────────────── */
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
    draft: { variant: "info", icon: Clock },
    pending: { variant: "info", icon: Clock },
    received: { variant: "success", icon: CheckCircle2 },
    cancelled: { variant: "neutral", icon: XCircle },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  const label = status === "draft" ? (t("draft") || "Draft") : (t(status) || status);
  return (
    <Badge variant={s.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

/* ── Add Inventory Item Modal ─────────────────────────────────────── */
function AddItemModal({ onClose, onSuccess }) {
  const t = useTranslations("inventory");
  const [form, setForm] = useState({ name: "", code: "", unit: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Item name is required."); return; }
    setSaving(true);
    setError("");
    try {
      await inventoryService.createItem({ ...form });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">{t("addItem")}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {t("itemName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Latex Gloves"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t("code")}
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. GLV-001"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {t("unit")}
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                placeholder="e.g. box, piece"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {t("description")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Optional description..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
              {saving ? <Spinner size="sm" /> : <Plus className="w-4 h-4 me-1" />}
              {saving ? "Saving..." : t("addItem")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── New Purchase Order Modal ─────────────────────────────────────── */
function NewPurchaseModal({ allItems, onClose, onSuccess }) {
  const t = useTranslations("inventory");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([{ inventory_item_id: "", quantity: "", unit_cost: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addLine = () => setLines((l) => [...l, { inventory_item_id: "", quantity: "", unit_cost: "" }]);
  const removeLine = (i) => setLines((l) => l.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) =>
    setLines((l) => l.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validLines = lines.filter((l) => l.inventory_item_id && l.quantity && l.unit_cost);
    if (!validLines.length) { setError("Add at least one item with quantity and cost."); return; }
    setSaving(true);
    setError("");
    try {
      await inventoryService.createPurchase({
        supplier_name: supplier || null,
        notes: notes || null,
        items: validLines.map((l) => ({
          inventory_item_id: parseInt(l.inventory_item_id),
          quantity: parseFloat(l.quantity),
          unit_cost: parseFloat(l.unit_cost),
        })),
      });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create purchase order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">{t("createPurchase")}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t("supplier")}
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name (optional)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t("notes")}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-600">
                  Items <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addLine}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>

              <div className="space-y-2">
                {lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <select
                        value={line.inventory_item_id}
                        onChange={(e) => updateLine(i, "inventory_item_id", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="">Select item...</option>
                        {allItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} {item.code ? `(${item.code})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) => updateLine(i, "quantity", e.target.value)}
                        placeholder="Qty"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={line.unit_cost}
                        onChange={(e) => updateLine(i, "unit_cost", e.target.value)}
                        placeholder="Unit Cost"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
              {saving ? <Spinner size="sm" /> : <ShoppingCart className="w-4 h-4 me-1" />}
              {saving ? "Creating..." : t("createPurchase")}
            </Button>
          </div>
        </form>
      </div>
    </div>
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

  // Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [showNewPurchase, setShowNewPurchase] = useState(false);

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

  // Fetch all items (no pagination) for the purchase modal select
  const [allItems, setAllItems] = useState([]);
  useEffect(() => {
    inventoryService.getItems({ per_page: 100 }).then((r) => setAllItems(r.data || [])).catch(() => {});
  }, []);

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
  const pendingPurchases = purchases.filter((p) => p.status === "pending" || p.status === "draft").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewPurchase(true)}
              className="flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              {t("createPurchase")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t("addItem")}
            </Button>
          </div>
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
                <button
                  onClick={() => setShowAddItem(true)}
                  className="mt-3 text-sm text-teal-600 font-semibold hover:underline"
                >
                  + Add your first item
                </button>
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
                <option value="draft">Draft / Pending</option>
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
                <button
                  onClick={() => setShowNewPurchase(true)}
                  className="mt-3 text-sm text-teal-600 font-semibold hover:underline"
                >
                  + Create your first purchase order
                </button>
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
                          {po.supplier?.name || "—"}
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
                            {(po.status === "pending" || po.status === "draft") && (
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

      {/* Modals */}
      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onSuccess={() => { setShowAddItem(false); fetchItems(); }}
        />
      )}
      {showNewPurchase && (
        <NewPurchaseModal
          allItems={allItems}
          onClose={() => setShowNewPurchase(false)}
          onSuccess={() => { setShowNewPurchase(false); fetchPurchases(); }}
        />
      )}
    </DashboardLayout>
  );
}
