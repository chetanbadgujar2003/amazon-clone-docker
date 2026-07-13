import api from "./api";

// Register User
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register/", userData);
  const token = response.data.access || response.data.token;
  if (token) {
    localStorage.setItem("token", token);
  }
  return response.data;
};

// Login User
export const loginUser = async (userData) => {
  const response = await api.post("/auth/login/", userData);
  const token = response.data.access || response.data.token;
  if (token) {
    localStorage.setItem("token", token);
  }
  return response.data;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("adminUser");
};

// Get Current User
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me/");
  return response.data;
};