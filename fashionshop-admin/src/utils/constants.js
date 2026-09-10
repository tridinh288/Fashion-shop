export const ORDER_STATUS = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  shipping: { label: "Đang giao", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
};

export const CONTACT_STATUS = {
  new: { label: "Mới", color: "bg-blue-100 text-blue-700" },
  read: { label: "Đã đọc", color: "bg-gray-100 text-gray-600" },
  resolved: { label: "Đã xử lý", color: "bg-green-100 text-green-700" },
};

export const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;

// Trạng thái được phép chuyển sang, phải khớp với Order::TRANSITIONS bên API.
// Đơn đã hoàn thành hoặc đã huỷ là trạng thái cuối, không đổi được nữa.
export const ORDER_TRANSITIONS = {
  pending: ["shipping", "cancelled"],
  shipping: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
