import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { getAddresses, addAddress, deleteAddress, setDefaultAddress } from "../api/addressApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const schema = z.object({
  fullname: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  phone: z.string().regex(/^\d{9,11}$/, "Số điện thoại 9-11 chữ số"),
  address_details: z.string().min(5, "Địa chỉ tối thiểu 5 ký tự"),
});

export default function Address() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  });

  const addresses = data?.data?.data || [];

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

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-100">Địa Chỉ Giao Hàng</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          <Plus size={15} /> Thêm Địa Chỉ
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-accent/10 border border-accent/40 p-5 mb-5">
          <h2 className="font-semibold text-neutral-300 mb-4">Địa Chỉ Mới</h2>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-3">
            {[
              { name: "fullname", label: "Người Nhận", placeholder: "Nguyễn Văn A" },
              { name: "phone", label: "Số Điện Thoại", placeholder: "0901234567" },
              { name: "address_details", label: "Địa Chỉ Chi Tiết", placeholder: "Số nhà, đường, phường, quận, thành phố" },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>
                <input
                  {...register(name)}
                  placeholder={placeholder}
                  className="w-full border bg-ink-1 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/40"
                />
                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-white text-sm font-semibold px-5 py-2 transition-colors">
                {saving ? "Đang lưu..." : "Lưu Địa Chỉ"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="border text-neutral-400 text-sm font-semibold px-5 py-2 hover:bg-ink transition-colors">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={48} className="text-neutral-800 mx-auto mb-3" />
          <p className="text-neutral-600">Chưa có địa chỉ nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-ink-1 border  p-4 ${addr.is_default ? "border-accent bg-accent/10" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-neutral-100 text-sm">{addr.fullname}</span>
                    <span className="text-neutral-600 text-sm">|</span>
                    <span className="text-neutral-400 text-sm">{addr.phone}</span>
                    {addr.is_default && (
                      <span className="bg-accent/15 text-accent text-xs font-semibold px-2 py-0.5 rounded-full">Mặc định</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">{addr.address_details}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-accent border border-accent px-2.5 py-1 hover:bg-accent/10 transition-colors"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-neutral-700 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
