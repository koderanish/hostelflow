import axios from "axios";

// Point this at Member 1's backend once it's deployed / running locally.
// For local dev on a physical phone, use your laptop's LAN IP, not "localhost".
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";

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
