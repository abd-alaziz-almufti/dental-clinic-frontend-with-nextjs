import { api } from "@/config/axios";

export const inventoryService = {
  async getItems({ page = 1, per_page = 15, name = "", low_stock = "" } = {}) {
    const params = { page, per_page, include: "stocks" };
    if (name) params["filter[name]"] = name;
    if (low_stock) params["filter[low_stock]"] = true;
    const res = await api.get("/inventory/items", { params });
    return res.data;
  },

  async getItemById(id) {
    const res = await api.get(`/inventory/items/${id}`, {
      params: { include: "stocks,consumptionTemplates" },
    });
    return res.data;
  },

  async createItem(data) {
    const res = await api.post("/inventory/items", data);
    return res.data;
  },

  async getPurchases({ page = 1, per_page = 15, status = "" } = {}) {
    const params = { page, per_page, include: "items,supplier,branch" };
    if (status) params["filter[status]"] = status;
    const res = await api.get("/purchases", { params });
    return res.data;
  },

  async createPurchase(data) {
    const res = await api.post("/purchases", data);
    return res.data;
  },

  async receivePurchase(purchaseId) {
    const res = await api.post(`/purchases/${purchaseId}/receive`);
    return res.data;
  },

  async cancelPurchase(purchaseId) {
    const res = await api.delete(`/purchases/${purchaseId}`);
    return res.data;
  },
};
