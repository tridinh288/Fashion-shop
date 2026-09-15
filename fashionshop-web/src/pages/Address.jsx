import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getAddresses, addAddress, deleteAddress, setDefaultAddress } from "../api/addressApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AccountNav from "../components/layout/AccountNav";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import Field from "../components/ui/Field";
import { INPUT_CLASS } from "../components/ui/fieldStyles";
import SectionHeading from "../components/ui/SectionHeading";

const schema = z.object({
  fullname: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  phone: z.string().regex(/^\d{9,11}$/, "Số điện thoại 9-11 chữ số"),
  address_details: z.string().min(5, "Địa chỉ tối thiểu 5 ký tự"),
});

const FIELDS = [
  { name: "fullname", label: "Người nhận", placeholder: "Nguyễn Văn A" },
  { name: "phone", label: "Số điện thoại", placeholder: "0901234567" },
  { name: "address_details", label: "Địa chỉ chi tiết", placeholder: "Số nhà, đường, phường, quận, thành phố" },
];

export default function Address() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  });

  const addresses = data?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["addresses"] });

  const onAdd = async (form) => {
    setSaving(true);
    try {
      await addAddress(form);
      toast.success("Đã thêm địa chỉ mới");
      reset();
      setShowForm(false);
      invalidate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thêm địa chỉ thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    try {
      await deleteAddress(id);
      toast.success("Đã xóa địa chỉ");
      invalidate();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast.success("Đã đặt làm địa chỉ mặc định");
      invalidate();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <Container className="py-10 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          as="h1"
          eyebrow="Tài khoản"
          title="Địa chỉ giao hàng"
          className="mb-8"
          action={
            <Button onClick={() => setShowForm((s) => !s)} aria-expanded={showForm} aria-controls="form-dia-chi">
              <Plus size={15} strokeWidth={1.5} aria-hidden="true" /> Thêm địa chỉ
            </Button>
          }
        />
        <AccountNav />

        {showForm && (
          <section id="form-dia-chi" className="mb-10 border border-line bg-surface p-6">
            <h2 className="font-display text-2xl text-ink">Địa chỉ mới</h2>
            <form onSubmit={handleSubmit(onAdd)} className="mt-5 flex flex-col gap-5">
              {FIELDS.map(({ name, label, placeholder }) => (
                <Field key={name} label={label} error={errors[name]?.message}>
                  <input {...register(name)} placeholder={placeholder} className={INPUT_CLASS} />
                </Field>
              ))}
              <div className="flex gap-3">
                <Button type="submit" loading={saving}>Lưu địa chỉ</Button>
                <Button variant="secondary" onClick={() => { setShowForm(false); reset(); }}>
                  Hủy
                </Button>
              </div>
            </form>
          </section>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : addresses.length === 0 ? (
          <EmptyState title="Chưa có địa chỉ nào" />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className={`flex flex-col border bg-surface p-5 ${addr.is_default ? "border-ink" : "border-line"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{addr.fullname}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">{addr.phone}</p>
                  </div>
                  {addr.is_default && <span className="eyebrow mt-1">Mặc định</span>}
                </div>
                <p className="mt-3 flex-1 text-sm text-ink-soft">{addr.address_details}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                  {!addr.is_default ? (
                    <Button variant="link" onClick={() => handleSetDefault(addr.id)} className="min-h-11">
                      Đặt mặc định
                    </Button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    aria-label={`Xoá địa chỉ của ${addr.fullname}`}
                    className="flex h-11 w-11 items-center justify-center text-ink-faint transition-colors duration-200 hover:text-sale"
                  >
                    <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
