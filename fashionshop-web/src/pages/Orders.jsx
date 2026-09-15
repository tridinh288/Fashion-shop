import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { getOrders } from "../api/orderApi";
import { formatCurrency } from "../utils/formatCurrency";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import SectionHeading from "../components/ui/SectionHeading";
import AccountNav from "../components/layout/AccountNav";

export default function Orders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    retry: false,
  });

  const orders = data?.data || [];

  return (
    <Container className="py-10 lg:py-14">
      <div className="mx-auto max-w-4xl">
      {/* Tiêu đề luôn hiện, kể cả khi đang tải (test E2E chờ h1) */}
      <SectionHeading as="h1" eyebrow="Tài khoản" title="Lịch sử đơn hàng" className="mb-8" />
      <AccountNav />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <p className="py-16 text-center text-sale">Không tải được đơn hàng</p>
      ) : orders.length === 0 ? (
        <EmptyState
          title="Chưa có đơn hàng nào"
          action={<Button to="/category" variant="secondary">Mua sắm ngay</Button>}
        />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="group flex items-center gap-4 py-5 transition-colors duration-200 hover:bg-tile/50 sm:px-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">Đơn #{order.id}</p>
                  <p className="mt-0.5 text-sm text-ink-faint">
                    {new Date(order.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                <StatusBadge status={order.status} />
                <p className="w-28 text-right text-sm font-medium tabular-nums text-ink">
                  {formatCurrency(order.total)}
                </p>
                <ChevronRight
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </Container>
  );
}
