import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Tự động đính kèm token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi 401 - tự động logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sai mật khẩu ở /login cũng trả 401: để trang đăng nhập tự báo lỗi,
    // không tải lại trang (tải lại sẽ xoá mất thông báo)
    const isLoginRequest = error.config?.url === "/login";
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
