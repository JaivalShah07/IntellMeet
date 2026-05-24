import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("intellmeet_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;
    const isAuthAttempt =
      originalConfig?.url?.includes("/auth/login") ||
      originalConfig?.url?.includes("/auth/register");

    if (err.response?.status === 401 && !isAuthAttempt && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const refreshToken = localStorage.getItem("intellmeet_refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("intellmeet_token", data.token);
        localStorage.setItem("intellmeet_refresh_token", data.refreshToken);

        originalConfig.headers.Authorization = `Bearer ${data.token}`;
        return api(originalConfig);
      } catch (_error) {
        localStorage.removeItem("intellmeet_token");
        localStorage.removeItem("intellmeet_refresh_token");
        localStorage.removeItem("intellmeet_user");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(_error);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
