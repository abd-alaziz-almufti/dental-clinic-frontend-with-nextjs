import { api } from "@/config/axios";

export const billingService = {
  async getInvoices({ page = 1, per_page = 15, status = "", patient_id = "" } = {}) {
    const params = {
      page,
      per_page,
      include: "items,payments,patient",
    };
    if (status) params["filter[status]"] = status;
    if (patient_id) params["filter[patient_id]"] = patient_id;

    const response = await api.get("/invoices", { params });
    return response.data;
  },

  async getInvoiceById(id) {
    const response = await api.get(`/invoices/${id}`, {
      params: { include: "items,payments,patient" },
    });
    return response.data;
  },

  async generateInvoice(visitId) {
    const response = await api.post(`/visits/${visitId}/invoice`);
    return response.data;
  },

  async recordPayment(invoiceId, data) {
    const response = await api.post(`/invoices/${invoiceId}/payments`, data);
    return response.data;
  },

  async cancelInvoice(invoiceId, cancellation_reason) {
    const response = await api.delete(`/invoices/${invoiceId}`, {
      data: { cancellation_reason },
    });
    return response.data;
  },
};
