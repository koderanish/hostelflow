import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://hostelflow-xgt1.vercel.app/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Call this after login to attach the JWT to every future request.
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}
