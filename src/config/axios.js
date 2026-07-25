import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach Auth Bearer token and Accept-Language header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Determine active locale (from pathname or cookie)
      const pathname = window.location.pathname;
      const locale = pathname.startsWith("/ar") ? "ar" : "en";
      config.headers["Accept-Language"] = locale;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already on login page
      if (!window.location.pathname.includes("/login")) {
        const locale = window.location.pathname.startsWith("/ar") ? "ar" : "en";
        window.location.href = `/${locale}/login?reason=expired`;
      }
    }
    return Promise.reject(error);
  }
);