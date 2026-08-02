import { api } from "@/config/axios";

export const settingsService = {
  /**
   * Fetch current branch profile or list of branches.
   */
  async getBranchProfile(branchId = 1) {
    try {
      const response = await api.get(`/branches/${branchId}`);
      return response.data;
    } catch {
      // Fallback to general list if single endpoint not present
      const response = await api.get("/branches");
      const list = response.data?.data || response.data || [];
      const found = list.find((b) => b.id === branchId) || list[0] || {};
      return { data: found };
    }
  },

  /**
   * Update branch profile fields (name, phone, email, address, city, tax_number, currency_code).
   */
  async updateBranchProfile(branchId = 1, data) {
    const response = await api.put(`/branches/${branchId}`, data);
    return response.data;
  },
};
