import { api } from "@/config/axios";

export const userService = {
  /**
   * Fetch paginated list of users.
   * Query params: page, per_page, search, role
   */
  async getUsers({ page = 1, per_page = 15, search = "", role = "" } = {}) {
    const params = { page, per_page };
    if (search) params["filter[name]"] = search;
    if (role) params["filter[role]"] = role;

    const response = await api.get("/users", { params });
    return response.data;
  },

  /**
   * Create a new user.
   * Note: Backend only accepts role='admin' or role='doctor' (super-admin cannot be created via API).
   */
  async createUser(data) {
    const response = await api.post("/users", data);
    return response.data;
  },

  /**
   * Fetch list of available branches for selection.
   */
  async getBranches() {
    const response = await api.get("/branches");
    return response.data;
  },
};
