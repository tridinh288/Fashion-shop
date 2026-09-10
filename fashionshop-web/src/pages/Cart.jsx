import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { getCart, updateCart, removeCartItem } from "../api/cartApi";
import { formatCurrency } from "../utils/formatCurrency";
import { SHIPPING_FEE } from "../utils/constants";
import useCartStore from "../stores/cartStore";

const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;



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

  const subtotal = items.reduce((s, i) => s + (i.product?.gia || 0) * i.quantity, 0);
  const total = subtotal + (SHIPPING_FEE || 30000);

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink mb-6">Giỏ Hàng</h1>

      {isLoading && !isError ? (
        <div className="text-center py-20 text-ink-faint">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={64} className="text-zinc-200 mx-auto mb-4" />
          <p className="text-ink-soft text-lg mb-4">Giỏ hàng trống</p>
          <Link
            to="/category"
            className="bg-ink text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-colors"
          >
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-tile-warm border-b">
                <input
                  type="checkbox"
                  checked={selected.length === items.length && items.length > 0}
                  onChange={toggleAll}
                  className="accent-blue-600"
                />
                <span className="text-sm font-medium text-ink-soft">
                  Chọn tất cả ({items.length})
                </span>
                {selected.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="ml-auto flex items-center gap-1 text-red-500 text-sm hover:text-red-700"
                  >
                    <Trash2 size={14} /> Xóa đã chọn ({selected.length})
                  </button>
                )}
              </div>

              {items.map((item) => {
                const img = item.product?.hinh_anh
                  ? `${IMG_BASE}${item.product.hinh_anh}`
                  : "https://placehold.co/80x80?text=SP";
                return (
                  <div key={item.id} className="flex items-center gap-4 px-4 py-4 border-b last:border-b-0">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="accent-blue-600"
                    />
                    <img
                      src={img}
                      alt={item.product?.ten_sp}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-ink line-clamp-2">
                        <Link
                          to={`/products/${item.product?.id}`}
                          className="hover:text-ink"
                        >
                          {item.product?.ten_sp}
                        </Link>
                      </h3>
                      <p className="text-xs text-ink-faint mt-0.5">Size: {item.size}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                        className="w-7 h-7 border rounded flex items-center justify-center hover:bg-tile-warm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                        className="w-7 h-7 border rounded flex items-center justify-center hover:bg-tile-warm"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right min-w-20">
                      <p className="text-sm font-bold text-ink">
                        {formatCurrency((item.product?.gia || 0) * item.quantity)}
                      </p>
                      <p className="text-xs text-ink-faint">{formatCurrency(item.product?.gia || 0)}/cái</p>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingIds.includes(item.id)}
                      className="text-ink-faint hover:text-red-500 transition-colors ml-1 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white border rounded-xl p-5 sticky top-20">
              <h2 className="font-bold text-ink mb-4">Tóm Tắt Đơn Hàng</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-ink-soft">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Phí ship</span>
                  <span>{formatCurrency(SHIPPING_FEE || 30000)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-ink text-base">
                  <span>Tổng cộng</span>
                  <span className="text-ink">{formatCurrency(total)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block w-full text-center bg-ink hover:bg-black text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Tiến Hành Thanh Toán
              </Link>
              <Link
                to="/category"
                className="block text-center text-sm text-ink hover:underline mt-3"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}