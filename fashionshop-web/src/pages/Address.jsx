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

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Địa Chỉ Giao Hàng</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 bg-ink hover:bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Thêm Địa Chỉ
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-tile border border-line rounded-xl p-5 mb-5">
          <h2 className="font-semibold text-ink-soft mb-4">Địa Chỉ Mới</h2>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-3">
            {[
              { name: "fullname", label: "Người Nhận", placeholder: "Nguyễn Văn A" },
              { name: "phone", label: "Số Điện Thoại", placeholder: "0901234567" },
              { name: "address_details", label: "Địa Chỉ Chi Tiết", placeholder: "Số nhà, đường, phường, quận, thành phố" },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-ink-soft mb-1">{label}</label>
                <input
                  {...register(name)}
                  placeholder={placeholder}
                  className="w-full border bg-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15"
                />
                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="bg-ink hover:bg-black disabled:bg-ink/40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                {saving ? "Đang lưu..." : "Lưu Địa Chỉ"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="border text-ink-soft text-sm font-semibold px-5 py-2 rounded-lg hover:bg-tile-warm transition-colors">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={48} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-ink-faint">Chưa có địa chỉ nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white border rounded-xl p-4 ${addr.is_default ? "border-ink bg-tile" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-ink text-sm">{addr.fullname}</span>
                    <span className="text-ink-faint text-sm">|</span>
                    <span className="text-ink-soft text-sm">{addr.phone}</span>
                    {addr.is_default && (
                      <span className="bg-tile text-ink text-xs font-semibold px-2 py-0.5 rounded-full">Mặc định</span>
                    )}
                  </div>
                  <p className="text-sm text-ink-soft">{addr.address_details}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-ink border border-ink px-2.5 py-1 rounded-lg hover:bg-tile transition-colors"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-ink-faint hover:text-red-500 transition-colors p-1"
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
