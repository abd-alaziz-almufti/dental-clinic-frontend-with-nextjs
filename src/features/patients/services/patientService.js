import { api } from "@/config/axios";

export const patientService = {
  async getPatients({ page = 1, per_page = 15, search = "", phone = "", national_id = "" } = {}) {
    const params = {
      page,
      per_page,
    };

    if (phone) params["filter[phone]"] = phone;
    if (national_id) params["filter[national_id]"] = national_id;
    if (search) params.search = search;

    const response = await api.get("/patients", { params });
    return response.data;
  },

  async getPatientById(id) {
    const response = await api.get(`/patients/${id}`, {
      params: { include: "medicalProfile" },
    });
    return response.data;
  },

  async registerPatient(data) {
    const response = await api.post("/patients", data);
    return response.data;
  },
};
