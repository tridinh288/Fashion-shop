import { formatCurrency } from "../../utils/formatCurrency";

/** Tạm tính, phí vận chuyển và tổng cộng — dùng ở Giỏ hàng và Thanh toán */
export default function SummaryRows({ subtotal, shipping, total }) {
  return (
    <dl className="flex flex-col gap-3 text-sm">
      <div className="flex justify-between text-ink-soft">
        <dt>Tạm tính</dt>
        <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-ink-soft">
        <dt>Phí vận chuyển</dt>
        <dd className="tabular-nums">{formatCurrency(shipping)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-4 text-ink">
        <dt className="font-medium">Tổng cộng</dt>
        <dd className="text-xl font-medium tabular-nums">{formatCurrency(total)}</dd>
      </div>
    </dl>
  );
}
