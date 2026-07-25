import { api } from "@/config/axios";

export const dashboardService = {
  async getTodayAppointments() {
    try {
      const response = await api.get("/appointments", {
        params: { "filter[date]": "today" },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch today's appointments", error);
      return { data: [], meta: { total: 0 } };
    }
  },

  async getPatientsSummary() {
    try {
      const response = await api.get("/patients", {
        params: { per_page: 1 },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch patients count", error);
      return { data: [], meta: { total: 0 } };
    }
  },
};
