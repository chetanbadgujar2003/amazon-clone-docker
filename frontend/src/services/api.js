import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Endpoints that are always meant to be anonymous — never attach a token
// here, even if a (possibly stale) one exists in localStorage. Sending an
// invalid/expired token on these causes the backend to reject the request
// with an auth error instead of treating it as a normal anonymous call.
const PUBLIC_ENDPOINTS = [
  "/auth/register",
  "/auth/admin-register",
  "/auth/login",
  "/auth/token/refresh",
  "/sellers/register",
  "/sellers/login",
];

function isPublicEndpoint(url = "") {
  return PUBLIC_ENDPOINTS.some((p) => url.includes(p));
}

// Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && !isPublicEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error.response?.data || error.message);

    // A stale/invalid token (e.g. pointing at a user that no longer exists
    // after a backend database reset) will keep failing every authenticated
    // request forever unless cleared. Self-heal instead of getting stuck.
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default api;