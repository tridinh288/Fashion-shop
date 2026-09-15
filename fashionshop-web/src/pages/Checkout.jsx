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
import { imageUrl } from "../utils/imageUrl";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import Field from "../components/ui/Field";
import { INPUT_CLASS } from "../components/ui/fieldStyles";
import SectionHeading from "../components/ui/SectionHeading";
import SummaryRows from "../components/ui/SummaryRows";

const schema = z.object({
  fullname: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().regex(/^\d{9,11}$/, "Số điện thoại 9-11 chữ số"),
  address: z.string().min(5, "Địa chỉ tối thiểu 5 ký tự"),
  payment: z.literal("COD"),
});

const FIELDS = [
  { name: "fullname", label: "Họ và tên", placeholder: "Nguyễn Văn A", autoComplete: "name" },
  { name: "phone", label: "Số điện thoại", placeholder: "0901234567", autoComplete: "tel", inputMode: "numeric" },
  { name: "address", label: "Địa chỉ", placeholder: "Số nhà, đường, phường, quận, thành phố", autoComplete: "street-address" },
];

const PLACEHOLDER = "https://placehold.co/300x400/ece6db/6b645a?text=SP";

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
  // Addresses: API trả { message, total, data: [...] }
  const addresses = addrData?.data?.data || [];

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
      <Container>
        <EmptyState
          title="Giỏ hàng của bạn đang trống"
          action={<Button to="/cart" variant="secondary">Quay lại giỏ hàng</Button>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading as="h1" eyebrow="Bước cuối" title="Thanh toán" className="mb-10" />

      <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
          {addresses.length > 0 && (
            <section>
              <h2 className="font-display text-2xl text-ink">Địa chỉ đã lưu</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => pickAddress(a)}
                    className="border border-line bg-surface p-4 text-left text-sm transition-colors duration-200 hover:border-ink"
                  >
                    <span className="flex items-center gap-2 font-medium text-ink">
                      {a.fullname}
                      {a.is_default ? <span className="eyebrow">Mặc định</span> : null}
                    </span>
                    <span className="mt-1 block text-ink-soft">{a.phone}</span>
                    <span className="mt-1 block text-ink-soft">{a.address_details}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display text-2xl text-ink">Thông tin giao hàng</h2>
            <div className="mt-5 flex flex-col gap-5">
              {FIELDS.map(({ name, label, placeholder, autoComplete, inputMode }) => (
                <Field key={name} label={label} error={errors[name]?.message}>
                  <input
                    {...register(name)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    className={INPUT_CLASS}
                  />
                </Field>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Phương thức thanh toán</h2>
            <label className="mt-5 flex cursor-pointer items-center gap-4 border border-ink bg-surface p-4">
              <input {...register("payment")} type="radio" value="COD" defaultChecked className="h-4 w-4" />
              <span>
                <span className="block text-sm font-medium text-ink">Thanh toán khi nhận hàng (COD)</span>
                <span className="block text-sm text-ink-soft">Trả tiền mặt khi nhận hàng</span>
              </span>
            </label>
          </section>

          <Button type="submit" size="lg" loading={loading} disabled={cartLoading} className="w-full">
            {cartLoading ? "Đang tải…" : `Đặt hàng — ${formatCurrency(total)}`}
          </Button>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line bg-surface p-6">
            <h2 className="font-display text-2xl text-ink">Đơn hàng ({items.length})</h2>
            <ul className="mt-5 flex max-h-72 flex-col gap-4 overflow-y-auto">
              {items.map((item) => {
                const img = item.product?.hinh_anh ? imageUrl(item.product.hinh_anh) : PLACEHOLDER;
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="aspect-[3/4] w-12 shrink-0 bg-tile">
                      <img src={img} alt="" className="h-full w-full object-contain p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-ink">{item.product?.ten_sp}</p>
                      <p className="text-xs text-ink-faint">Size {item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-sm tabular-nums text-ink">
                      {formatCurrency((item.product?.gia || 0) * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t border-line pt-6">
              <SummaryRows subtotal={subtotal} shipping={SHIPPING_FEE} total={total} />
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
