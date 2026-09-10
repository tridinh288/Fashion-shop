export const SIZES = ["S", "M", "L", "XL"];

export const SHIPPING_FEE = 30000;

// Màu trạng thái là màu ngữ nghĩa, tách khỏi màu thương hiệu
export const ORDER_STATUS = {
  pending: {
    label: "Chờ xử lý",
    color: "border border-amber-200 bg-amber-50 text-amber-700",
  },
  shipping: {
    label: "Đang giao",
    color: "border border-sky-200 bg-sky-50 text-sky-700",
  },
  completed: {
    label: "Hoàn thành",
    color: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  cancelled: {
    label: "Đã hủy",
    color: "border border-red-200 bg-red-50 text-red-700",
  },
};

export const GENDER_MAP = { 1: "Nam", 0: "Nữ" };
