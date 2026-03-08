// diasense-ai-dashboard/src/api/axios.js (FULL REPLACE)
import axios from "axios";

// ✅ Use .env first, fallback to localhost
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  // ✅ IMPORTANT:
  // Do NOT set Content-Type globally.
  // Axios will set:
  // - application/json for normal objects
  // - multipart/form-data; boundary=... for FormData
});

// ✅ Request interceptor: attach JWT and set correct headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Ensure headers exist
    config.headers = config.headers || {};

    // Attach token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ If data is FormData, DO NOT set Content-Type manually
    // (axios/browser will set the boundary automatically)
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      // Remove any accidental content-type
      if (config.headers["Content-Type"]) delete config.headers["Content-Type"];
      if (config.headers["content-type"]) delete config.headers["content-type"];
    }

    // ✅ Optional debug (comment out later)
    // console.log("[API]", config.method?.toUpperCase(), config.url, {
    //   isFormData,
    //   contentType: config.headers["Content-Type"] || config.headers["content-type"],
    // });

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: handle expired/invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // prevent infinite reload loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;