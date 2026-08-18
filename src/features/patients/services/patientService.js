import { api } from "@/config/axios";

export const patientService = {
  async getPatients({ page = 1, per_page = 15, search = "", phone = "", national_id = "" } = {}) {
    try {
      const params = {
        page,
        per_page,
      };

      if (phone) params["filter[phone]"] = phone;
      if (national_id) params["filter[national_id]"] = national_id;
      if (search) {
        params.search = search;
        params["filter[search]"] = search;
      }

      const response = await api.get("/patients", { params });
      return response.data;
    } catch (error) {
      console.warn("Could not fetch patients list", error?.response?.data || error.message);
      return { data: [], meta: { total: 0, current_page: 1, last_page: 1 } };
    }
  },

  async getPatientById(id) {
    const response = await api.get(`/patients/${id}`, {
      params: { include: "medicalProfile" },
    });
    return response.data;
  },

  async registerPatient(data) {
    const payload = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== "" && val !== null && val !== undefined) {
        payload[key] = val;
      }
    }
    const response = await api.post("/patients", payload);
    return response.data;
  },
};
