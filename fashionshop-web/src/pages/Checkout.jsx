import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { getCart } from "../api/cartApi";
import { getAddresses } from "../api/addressApi";
import { placeOrder } from "../api/orderApi";
import useCartStore from "../stores/cartStore";
import { formatCurrency } from "../utils/formatCurrency";
import { SHIPPING_FEE } from "../utils/constants";

const IMG_BASE = `${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/storage/`;

const schema = z.object({
  fullname: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().regex(/^\d{9,11}$/, "Số điện thoại 9-11 chữ số"),
  address: z.string().min(5, "Địa chỉ tối thiểu 5 ký tự"),
  payment: z.literal("COD"),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { setCount } = useCartStore();
  const [loading, setLoading] = useState(false);

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    retry: false,
  });

  const { data: addrData } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    enabled: !!cartData,
    retry: false,
  });

  // Cart: direct array
  const items = cartData?.data?.data || [];
  // Addresses: direct array
  const addresses = addrData?.data || [];

  const subtotal = items.reduce((s, i) => s + (i.product?.gia || 0) * i.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { payment: "COD" },
  });

  const pickAddress = (addr) => {
    setValue("fullname", addr.fullname);
    setValue("phone", addr.phone);
    setValue("address", addr.address_details);
  };

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    setLoading(true);
    try {
      const res = await placeOrder(data);
      const orderId = res.data?.order?.id || res.data?.id;
      setCount(0);
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!cartLoading && items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-soft text-lg mb-4">Giỏ hàng của bạn đang trống</p>
        <a href="/cart" className="bg-ink text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-colors inline-block">
          Quay Lại Giỏ Hàng
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ink mb-6">Thanh Toán</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Saved addresses */}
            {addresses.length > 0 && (
              <div className="bg-white border rounded-xl p-5">
                <p className="font-semibold text-ink-soft mb-3">Địa Chỉ Đã Lưu</p>
                <div className="space-y-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => pickAddress(a)}
                      className="w-full text-left border rounded-lg p-3 hover:border-ink hover:bg-tile transition-colors text-sm"
                    >
                      <span className="font-medium">{a.fullname}</span> — {a.phone}
                      {a.is_default ? <span className="ml-2 text-xs text-ink font-semibold">[Mặc định]</span> : null}
                      <br />
                      <span className="text-ink-soft">{a.address_details}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery info */}
            <div className="bg-white border rounded-xl p-5 space-y-4">
              <p className="font-semibold text-ink-soft">Thông Tin Giao Hàng</p>
              {[
                { name: "fullname", label: "Họ và Tên", placeholder: "Nguyễn Văn A" },
                { name: "phone", label: "Số Điện Thoại", placeholder: "0901234567" },
                { name: "address", label: "Địa Chỉ", placeholder: "Số nhà, đường, phường, quận, thành phố" },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-ink-soft mb-1">{label}</label>
                  <input
                    {...register(name)}
                    placeholder={placeholder}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15"
                  />
                  {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
                </div>
              ))}
            </div>

            {/* Payment */}
            <div className="bg-white border rounded-xl p-5">
              <p className="font-semibold text-ink-soft mb-3">Phương Thức Thanh Toán</p>
              <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-tile-warm">
                <input {...register("payment")} type="radio" value="COD" defaultChecked className="accent-blue-600" />
                <div>
                  <p className="text-sm font-medium text-ink">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-xs text-ink-soft">Trả tiền mặt khi nhận hàng</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={cartLoading || loading}
              className="w-full bg-ink hover:bg-black disabled:bg-ink/40 text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              {loading ? "Đang đặt hàng..." : cartLoading ? "Đang tải..." : `Đặt Hàng — ${formatCurrency(total)}`}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white border rounded-xl p-5 sticky top-20">
            <h2 className="font-bold text-ink mb-4">Đơn Hàng ({items.length} sản phẩm)</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => {
                const img = item.product?.hinh_anh
                  ? `${IMG_BASE}${item.product.hinh_anh}`
                  : "https://placehold.co/60x60?text=SP";
                return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={img} alt={item.product?.ten_sp} className="w-12 h-12 object-cover rounded-lg border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink line-clamp-2">{item.product?.ten_sp}</p>
                      <p className="text-xs text-ink-faint">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-ink-soft">{formatCurrency((item.product?.gia || 0) * item.quantity)}</p>
                  </div>
                );
              })}
            </div>
            <hr className="mb-3" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-soft"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-ink-soft"><span>Phí ship</span><span>{formatCurrency(SHIPPING_FEE)}</span></div>
              <hr />
              <div className="flex justify-between font-bold text-ink text-base"><span>Tổng cộng</span><span>{formatCurrency(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
