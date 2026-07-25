import { api } from "@/config/axios";

export const authService = {
  async login(email, password) {
    const response = await api.post("/login", { email, password });
    return response.data; // Envelope: { success, message, data: { token, user } }
  },

  async logout() {
    try {
      const response = await api.post("/logout");
      return response.data;
    } catch (error) {
      // Return fallback if network fails
      return { success: true };
    }
  },

  async getMe() {
    const response = await api.get("/me");
    return response.data; // Envelope: { success, message, data: user }
  },
};
