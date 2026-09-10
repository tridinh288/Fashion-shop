import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { getOrders } from "../api/orderApi";
import { formatCurrency } from "../utils/formatCurrency";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Orders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    retry: false,
  });

  const orders = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 🔥 luôn render h1 để test không fail */}
      <h1 className="text-2xl font-bold text-ink mb-6">
        Lịch Sử Đơn Hàng
      </h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <p className="text-center text-red-400">Không tải được đơn hàng</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="text-zinc-200 mx-auto mb-4" />
          <p className="text-ink-soft text-lg mb-4">Chưa có đơn hàng nào</p>
          <Link
            to="/category"
            className="bg-ink text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-colors"
          >
            Mua Sắm Ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white border rounded-xl p-4 hover:border-ink hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">
                    Đơn #{order.id}
                  </p>
                  <p className="text-sm text-ink-faint mt-0.5">
                    {new Date(order.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-ink mb-1">
                    {formatCurrency(order.total)}
                  </p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}