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
      <h1 className="text-2xl font-bold text-neutral-100 mb-6">
        Lịch Sử Đơn Hàng
      </h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <p className="text-center text-red-400">Không tải được đơn hàng</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="text-neutral-800 mx-auto mb-4" />
          <p className="text-neutral-500 text-lg mb-4">Chưa có đơn hàng nào</p>
          <Link
            to="/category"
            className="bg-accent text-white px-6 py-2.5 font-semibold hover:bg-accent-hover transition-colors"
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
              className="block bg-ink-1 border p-4 hover:border-accent transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-100">
                    Đơn #{order.id}
                  </p>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    {new Date(order.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-accent mb-1">
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