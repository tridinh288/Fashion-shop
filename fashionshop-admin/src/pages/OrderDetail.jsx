import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getOrder, updateOrderStatus } from "../api/orderApi";
import { formatCurrency } from "../utils/formatCurrency";
import { ORDER_STATUS, IMG_BASE } from "../utils/constants";
import { OrderBadge } from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";

export default function OrderDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => getOrder(id),
  });

  const order   = data?.data;
  const details = order?.details || [];

  const handleStatus = async (status) => {
    setSaving(true);
    try {
      await updateOrderStatus(id, status);
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Đã cập nhật trạng thái");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Spinner />;
  if (!order) return <p className="p-6 text-gray-400">Không tìm thấy đơn hàng</p>;

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        <ArrowLeft size={16} /> Quay lại
      </button>

      <div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-800">
      Chi tiết đơn hàng #{order.id}
    </h1>

    <p className="text-sm text-gray-400 mt-0.5">
      {new Date(order.created_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>
  </div>

  <OrderBadge status={order.status} />
</div>

      {/* Products */}
      <div className="bg-white border rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 bg-gray-50 border-b font-semibold text-gray-700 text-sm">Sản Phẩm</div>
        {details.map((item) => {
          const img = item.product?.hinh_anh
            ? `${IMG_BASE}${item.product.hinh_anh}`
            : "https://placehold.co/56x56?text=SP";
          return (
            <div key={item.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
              <img src={img} alt={item.product?.ten_sp} className="w-14 h-14 object-cover rounded-lg border" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.product?.ten_sp || "Sản phẩm"}</p>
                <p className="text-xs text-gray-400">Size: {item.size} × {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-700">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="font-semibold text-gray-700 text-sm mb-3">Thông Tin Giao Hàng</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Người nhận:</span> {order.fullname}</p>
            <p><span className="font-medium">SĐT:</span> {order.phone}</p>
            <p><span className="font-medium">Địa chỉ:</span> {order.address}</p>
            <p><span className="font-medium">Thanh toán:</span> {order.payment}</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="font-semibold text-gray-700 text-sm mb-3">Khách Hàng</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Họ tên:</span> {order.user?.fullname}</p>
            <p><span className="font-medium">Email:</span> {order.user?.email}</p>
            <p><span className="font-medium">SĐT:</span> {order.user?.phone}</p>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex justify-between font-bold text-blue-600 text-base">
          <span>Tổng cộng (đã gồm ship)</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Cập nhật trạng thái: chỉ hiện những bước đi được từ trạng thái hiện tại,
          để quản trị viên không bấm phải thứ chắc chắn bị API từ chối */}
      <div className="bg-white border rounded-xl p-4">
        <p className="font-semibold text-gray-700 text-sm mb-1">Cập Nhật Trạng Thái</p>
        <p className="text-xs text-gray-500 mb-3">
          Hiện tại: <span className="font-medium text-gray-700">{ORDER_STATUS[order.status]?.label ?? order.status}</span>
        </p>

        {(ORDER_TRANSITIONS[order.status] ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">
            Đơn đã {ORDER_STATUS[order.status]?.label.toLowerCase()}, không thể đổi trạng thái nữa.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {(ORDER_TRANSITIONS[order.status] ?? []).map((key) => {
                const huy = key === "cancelled";
                return (
                  <button
                    key={key}
                    onClick={() => handleStatus(key)}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border disabled:opacity-50 ${
                      huy
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {ORDER_STATUS[key]?.label ?? key}
                  </button>
                );
              })}
            </div>
            {ORDER_TRANSITIONS[order.status].includes("cancelled") && (
              <p className="text-xs text-gray-500 mt-3">
                Huỷ đơn sẽ trả toàn bộ sản phẩm trong đơn về lại kho.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
