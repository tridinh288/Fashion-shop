export const SIZES = ["S", "M", "L", "XL"];

export const SHIPPING_FEE = 30000;

// Màu trạng thái là màu ngữ nghĩa, tách khỏi màu nhấn của thương hiệu
export const ORDER_STATUS = {
  pending: {
    label: "Chờ xử lý",
    color: "border border-amber-500/25 bg-amber-500/10 text-amber-400",
  },
  shipping: {
    label: "Đang giao",
    color: "border border-sky-500/25 bg-sky-500/10 text-sky-400",
  },
  completed: {
    label: "Hoàn thành",
    color: "border border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  },
  cancelled: {
    label: "Đã hủy",
    color: "border border-red-500/25 bg-red-500/10 text-red-400",
  },
};

export const GENDER_MAP = { 1: "Nam", 0: "Nữ" };
