import axios from "axios";

const BASE_URL = "https://hostelflow-xgt1.vercel.app/api/v1";
console.log("[API] Base URL:", BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  console.log("[API] Request:", config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ECONNABORTED") {
      console.warn("[API] Request timed out:", err.config?.url, "base:", err.config?.baseURL);
    } else {
      console.warn("[API] Request error:", err.message, err.config?.url);
    }
    return Promise.reject(err);
  }
);

// Call this after login to attach the JWT to every future request.
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}
