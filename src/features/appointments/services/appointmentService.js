import { api } from "@/config/axios";

export const appointmentService = {
  async getAppointments({ date, doctor_id, status } = {}) {
    const params = {};
    if (date) params["filter[appointment_date]"] = date;
    if (doctor_id) params["filter[doctor_profile_id]"] = doctor_id;
    if (status) params["filter[status]"] = status;

    const response = await api.get("/appointments", { params });
    return response.data;
  },

  async bookAppointment(data) {
    const response = await api.post("/appointments", data);
    return response.data;
  },

  async cancelAppointment(id) {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};
