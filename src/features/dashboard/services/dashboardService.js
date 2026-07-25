import { api } from "@/config/axios";

export const dashboardService = {
  async getTodayAppointments() {
    try {
      // Format today's date as YYYY-MM-DD for backend appointment_date filter
      const todayStr = new Date().toISOString().split("T")[0];
      const response = await api.get("/appointments", {
        params: { "filter[appointment_date]": todayStr },
      });
      return response.data;
    } catch (error) {
      console.warn("Could not fetch today's appointments", error?.response?.data || error.message);
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
      console.warn("Could not fetch patients summary", error?.response?.data || error.message);
      return { data: [], meta: { total: 0 } };
    }
  },
};
