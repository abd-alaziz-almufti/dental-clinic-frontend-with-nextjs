import { api } from "@/config/axios";

export const visitService = {
  async getVisits({ page = 1, per_page = 15, status = "", doctor_id = "", patient_id = "" } = {}) {
    const params = { page, per_page, include: "patient,doctorProfile" };
    if (status) params["filter[status]"] = status;
    if (doctor_id) params["filter[doctor_profile_id]"] = doctor_id;
    if (patient_id) params["filter[patient_id]"] = patient_id;

    const response = await api.get("/visits", { params });
    return response.data;
  },

  async getVisitById(id) {
    const response = await api.get(`/visits/${id}`, {
      params: { include: "patient,visitServices,visitTeeth,visitServices.service" },
    });
    return response.data;
  },

  async saveToothCondition(visitId, data) {
    const response = await api.post(`/visits/${visitId}/teeth`, data);
    return response.data;
  },

  async removeToothCondition(visitId, visitToothId) {
    const response = await api.delete(`/visits/${visitId}/teeth/${visitToothId}`);
    return response.data;
  },

  async addVisitService(visitId, data) {
    const response = await api.post(`/visits/${visitId}/services`, data);
    return response.data;
  },

  async removeVisitService(visitId, serviceId) {
    const response = await api.delete(`/visits/${visitId}/services/${serviceId}`);
    return response.data;
  },
};
