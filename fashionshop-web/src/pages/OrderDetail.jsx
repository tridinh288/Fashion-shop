import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getOrder, cancelOrder } from "../api/orderApi";
import { formatCurrency } from "../utils/formatCurrency";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import { imageUrl } from "../utils/imageUrl";

const PLACEHOLDER = "https://placehold.co/300x400/ece6db/6b645a?text=SP";

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
  if (!order) {
    return (
      <Container>
        <EmptyState
          title="Không tìm thấy đơn hàng"
          action={<Button to="/orders" variant="secondary">Về lịch sử đơn hàng</Button>}
        />
      </Container>
    );
  }

  // Quan hệ là "details" (không phải order_details)
  const details = order.details || [];

  return (
    <Container className="py-10 lg:py-14">
      <div className="mx-auto max-w-4xl">
      <Link
        to="/orders"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
      >
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" /> Lịch sử đơn hàng
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="eyebrow">Chi tiết đơn</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Đơn hàng #{order.id}</h1>
          <p className="mt-2 text-sm text-ink-faint">
            {new Date(order.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className="py-8">
        <h2 className="font-display text-2xl text-ink">Sản phẩm</h2>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {details.map((item) => {
            const img = item.product?.hinh_anh ? imageUrl(item.product.hinh_anh) : PLACEHOLDER;
            return (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="aspect-[3/4] w-14 shrink-0 bg-tile">
                  <img src={img} alt="" className="h-full w-full object-contain p-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{item.product?.ten_sp || "Sản phẩm"}</p>
                  <p className="text-xs text-ink-faint">Size {item.size} × {item.quantity}</p>
                </div>
                <p className="text-sm tabular-nums text-ink">{formatCurrency(item.price * item.quantity)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl text-ink">Giao hàng</h2>
          <dl className="mt-5 flex flex-col gap-2 text-sm">
            {[
              ["Người nhận", order.fullname],
              ["Số điện thoại", order.phone],
              ["Địa chỉ", order.address],
              ["Thanh toán", order.payment],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-3">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="sm:text-right">
          <h2 className="font-display text-2xl text-ink">Tổng cộng</h2>
          <p className="mt-5 text-3xl tabular-nums text-ink">{formatCurrency(order.total)}</p>
          <p className="mt-1 text-sm text-ink-faint">Đã gồm phí vận chuyển</p>
        </section>
      </div>

      {order.status === "pending" && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-12 flex min-h-13 w-full items-center justify-center border border-sale text-[13px] font-semibold text-sale transition-colors duration-200 hover:bg-sale hover:text-white disabled:opacity-50"
        >
          {cancelling ? "Đang hủy…" : "Hủy đơn hàng"}
        </button>
      )}
      </div>
    </Container>
  );
}
