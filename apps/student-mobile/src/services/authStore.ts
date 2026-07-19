import { setAuthToken } from '../api/client';

let storedToken: string | null = null;
let storedUser: any = null;

export const authStore = {
  getToken: () => storedToken,
  setToken: (token: string | null) => {
    storedToken = token;
    setAuthToken(token);
  },
  getUser: () => storedUser,
  setUser: (user: any) => {
    storedUser = user;
  },
  clear: () => {
    storedToken = null;
    storedUser = null;
    setAuthToken(null);
  },
  isAuthenticated: () => storedToken !== null,
};
