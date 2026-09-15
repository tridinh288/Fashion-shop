import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getCart, updateCart, removeCartItem } from "../api/cartApi";
import { formatCurrency } from "../utils/formatCurrency";
import { SHIPPING_FEE } from "../utils/constants";
import useCartStore from "../stores/cartStore";
import { imageUrl } from "../utils/imageUrl";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import SectionHeading from "../components/ui/SectionHeading";
import SummaryRows from "../components/ui/SummaryRows";

const PLACEHOLDER = "https://placehold.co/300x400/ece6db/6b645a?text=SP";

// Nút tăng giảm dùng ký tự "+" / "−" (test E2E tìm nút có chữ "+")
const QTY_BTN =
  "flex h-11 w-10 items-center justify-center text-base text-ink transition-colors duration-200 hover:bg-tile disabled:cursor-not-allowed disabled:opacity-40";

export default function Cart() {
  const qc = useQueryClient();
  const setCount = useCartStore((s) => s.setCount);
  const [selected, setSelected] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    retry: false,
  });

  const items = data?.data?.data || [];

  useEffect(() => {
    setCount(items.length);
  }, [items.length, setCount]);

  const shipping = SHIPPING_FEE || 30000;
  const subtotal = items.reduce((s, i) => s + (i.product?.gia || 0) * i.quantity, 0);
  const total = subtotal + shipping;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart"] });

  const handleQtyChange = async (id, qty) => {
    if (qty < 1) return;
    if (id >= 9000) return;
    try {
      await updateCart(id, { quantity: qty });
      invalidate();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (id >= 9000) return;
    setDeletingIds((prev) => [...prev, id]);
    try {
      await removeCartItem(id);
      setSelected((s) => s.filter((x) => x !== id));
      invalidate();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeletingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    const realIds = selected.filter((id) => id < 9000);
    if (realIds.length === 0) { setSelected([]); return; }
    setDeletingIds(realIds);
    try {
      await Promise.all(realIds.map((id) => removeCartItem(id)));
      toast.success(`Đã xóa ${realIds.length} sản phẩm`);
      setSelected([]);
      invalidate();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeletingIds([]);
    }
  };

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () =>
    setSelected(selected.length === items.length ? [] : items.map((i) => i.id));

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading as="h1" eyebrow="Mua sắm" title="Giỏ hàng" className="mb-10" />

      {isLoading && !isError ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="Giỏ hàng trống"
          action={<Button to="/category" variant="secondary">Tiếp tục mua sắm</Button>}
        />
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div>
            <div className="flex min-h-11 items-center gap-3 border-b border-line pb-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={selected.length === items.length && items.length > 0}
                  onChange={toggleAll}
                  className="h-4 w-4"
                />
                Chọn tất cả ({items.length})
              </label>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="ml-auto flex min-h-11 items-center gap-1.5 text-sm text-sale hover:underline"
                >
                  <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" /> Xoá đã chọn ({selected.length})
                </button>
              )}
            </div>

            <ul className="divide-y divide-line">
              {items.map((item) => {
                const name = item.product?.ten_sp;
                const img = item.product?.hinh_anh ? imageUrl(item.product.hinh_anh) : PLACEHOLDER;
                return (
                  <li key={item.id} data-testid="cart-item" className="flex gap-4 py-6 sm:gap-6">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      aria-label={`Chọn ${name}`}
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <Link
                      to={`/products/${item.product?.id}`}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="block aspect-[3/4] w-20 shrink-0 bg-tile sm:w-24"
                    >
                      <img src={img} alt="" className="h-full w-full object-contain p-2" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-normal leading-snug tracking-normal text-ink">
                          <Link to={`/products/${item.product?.id}`} className="link-underline">
                            {name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-ink-faint">
                          Size {item.size} · {formatCurrency(item.product?.gia || 0)}/cái
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                        <div className="flex items-center border border-line">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Giảm số lượng"
                            className={QTY_BTN}
                          >
                            −
                          </button>
                          <span className="w-9 text-center text-sm tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                            aria-label="Tăng số lượng"
                            className={QTY_BTN}
                          >
                            +
                          </button>
                        </div>
                        <p className="min-w-24 text-right text-sm font-medium tabular-nums text-ink">
                          {formatCurrency((item.product?.gia || 0) * item.quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingIds.includes(item.id)}
                          aria-label={`Xoá ${name}`}
                          className="flex h-11 w-11 items-center justify-center text-ink-faint transition-colors duration-200 hover:text-sale disabled:opacity-50"
                        >
                          <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-surface p-6">
              <h2 className="font-display text-2xl text-ink">Tóm tắt đơn hàng</h2>
              <div className="mt-6">
                <SummaryRows subtotal={subtotal} shipping={shipping} total={total} />
              </div>
              <Button to="/checkout" size="lg" className="mt-6 w-full">
                Tiến hành thanh toán
              </Button>
              <Button to="/category" variant="link" className="mt-4 w-full">
                Tiếp tục mua sắm
              </Button>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
