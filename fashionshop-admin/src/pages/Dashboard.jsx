import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Clock, ShoppingBag, Users, Package } from "lucide-react";
import { getDashboard } from "../api/dashboardApi";
import { formatCurrency } from "../utils/formatCurrency";
import { OrderBadge } from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";

/** Thẻ doanh thu: số lớn kèm phần bóc tách bên dưới */
function RevenueCard({ label, value, hint, icon: Icon, color, breakdown }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={19} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
      </div>

      <p className="text-2xl font-bold text-gray-800 tabular-nums">{formatCurrency(value)}</p>

      {breakdown && (
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-x-5 gap-y-1">
          {breakdown.map((b) => (
            <span key={b.label} className="text-xs text-gray-500">
              {b.label}{" "}
              <span className="font-semibold text-gray-700 tabular-nums">
                {formatCurrency(b.value)}
              </span>
              {b.count != null && <span className="text-gray-400"> · {b.count} đơn</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
  });

  const d = data?.data;

  if (isLoading) return <Spinner />;

  const revenue = d?.revenue ?? {};
  const counts = d?.order_counts ?? {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Doanh thu: đã thu về và còn chờ. Đơn đã huỷ không tính vào đâu cả. */}
      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        <RevenueCard
          label="Doanh Thu"
          hint="Từ các đơn đã hoàn thành"
          value={revenue.completed ?? d?.total_revenue}
          icon={TrendingUp}
          color="bg-green-500"
          breakdown={[{ label: "Đơn hoàn thành:", value: revenue.completed ?? 0, count: counts.completed }]}
        />
        <RevenueCard
          label="Dự Kiến"
          hint="Đơn chờ xử lý và đang giao"
          value={revenue.expected}
          icon={Clock}
          color="bg-amber-500"
          breakdown={[
            { label: "Chờ xử lý:", value: revenue.pending ?? 0, count: counts.pending },
            { label: "Đang giao:", value: revenue.shipping ?? 0, count: counts.shipping },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard label="Đơn Hàng" value={d?.total_orders} icon={ShoppingBag} color="bg-blue-500" />
        <StatCard label="Người Dùng" value={d?.total_users} icon={Users} color="bg-purple-500" />
        <StatCard label="Sản Phẩm" value={d?.total_products} icon={Package} color="bg-orange-500" />
      </div>

      {counts.cancelled > 0 && (
        <p className="text-xs text-gray-400 mb-8 -mt-4">
          Không tính {counts.cancelled} đơn đã huỷ ({formatCurrency(revenue.cancelled ?? 0)}).
        </p>
      )}

      {/* Đơn hàng gần đây */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b font-semibold text-gray-700">Đơn Hàng Gần Đây</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">ID</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Khách Hàng</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Tổng Tiền</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Trạng Thái</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(d?.recent_orders || []).map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">#{o.id}</td>
                  <td className="px-5 py-3 text-gray-600">{o.user?.fullname || o.fullname}</td>
                  <td className="px-5 py-3 font-semibold text-blue-600 tabular-nums">
                    {formatCurrency(o.total)}
                  </td>
                  <td className="px-5 py-3">
                    <OrderBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(o.created_at).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
