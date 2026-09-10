import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { getOrder, cancelOrder } from "../api/orderApi";
import { formatCurrency } from "../utils/formatCurrency";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;

export default function OrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
  });

  // Order detail: direct object
  const order = data?.data?.order;

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancelling(true);
    try {
      await cancelOrder(id);
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đã hủy đơn hàng");
    } catch (err) {
      toast.error(err.response?.data?.message || "Hủy đơn thất bại");
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!order) return <div className="text-center py-20 text-ink-faint">Không tìm thấy đơn hàng</div>;

  // Quan hệ là "details" (không phải order_details)
  const details = order.details || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Đơn Hàng #{order.id}</h1>
          <p className="text-sm text-ink-faint mt-1">
            {new Date(order.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Products */}
      <div className="bg-white border rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 bg-tile-warm border-b font-semibold text-ink-soft text-sm">Sản Phẩm</div>
        {details.map((item) => {
          const img = item.product?.hinh_anh
            ? `${IMG_BASE}${item.product.hinh_anh}`
            : "https://placehold.co/64x64?text=SP";
          return (
            <div key={item.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
              <img src={img} alt={item.product?.ten_sp} className="w-14 h-14 object-cover rounded-lg border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{item.product?.ten_sp || "Sản phẩm"}</p>
                <p className="text-xs text-ink-faint">Size: {item.size} × {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-ink-soft">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          );
        })}
      </div>

      {/* Delivery */}
      <div className="bg-white border rounded-xl p-4 mb-4">
        <p className="font-semibold text-ink-soft text-sm mb-3">Thông Tin Giao Hàng</p>
        <div className="text-sm text-ink-soft space-y-1">
          <p><span className="font-medium">Người nhận:</span> {order.fullname}</p>
          <p><span className="font-medium">SĐT:</span> {order.phone}</p>
          <p><span className="font-medium">Địa chỉ:</span> {order.address}</p>
          <p><span className="font-medium">Thanh toán:</span> {order.payment}</p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex justify-between font-bold text-ink text-base">
          <span>Tổng cộng (đã gồm ship)</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {order.status === "pending" && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full border-2 border-red-400 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {cancelling ? "Đang hủy..." : "Hủy Đơn Hàng"}
        </button>
      )}
    </div>
  );
}
