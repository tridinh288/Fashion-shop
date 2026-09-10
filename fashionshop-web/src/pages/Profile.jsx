import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { updateProfile, changePassword } from "../api/profileApi";
import useAuthStore from "../stores/authStore";

const profileSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^\d{9,11}$/, "Số điện thoại 9-11 chữ số"),
  gender: z.enum(["Nam", "Nữ"]),
});

// Backend: old_password, new_password, new_password_confirmation
const pwSchema = z.object({
  old_password: z.string().min(1, "Nhập mật khẩu hiện tại"),
  new_password: z.string().min(6, "Tối thiểu 6 ký tự"),
  new_password_confirmation: z.string(),
}).refine((d) => d.new_password === d.new_password_confirmation, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["new_password_confirmation"],
});

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const token = localStorage.getItem("token");
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || "",
      phone: user?.phone || "",
      gender: user?.gender || "Nam",
    },
  });

  const { register: regPw, handleSubmit: submitPw, reset: resetPw, formState: { errors: pwErrors } } = useForm({
    resolver: zodResolver(pwSchema),
  });

  const onProfile = async (data) => {
    setSaving(true);
    try {
      await updateProfile(data);
      // Profile update trả về { message } — cập nhật local store
      setAuth({ ...user, ...data }, token);
      toast.success("Cập nhật thành công!");
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) Object.values(errs).flat().forEach((m) => toast.error(m));
      else toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const onPassword = async (data) => {
    setPwSaving(true);
    try {
      await changePassword(data);
      toast.success("Đổi mật khẩu thành công!");
      resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-ink">Hồ Sơ Cá Nhân</h1>

      {/* Profile */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-ink-soft mb-4">Thông Tin Cá Nhân</h2>
        <form onSubmit={handleSubmit(onProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Họ và Tên</label>
            <input
              defaultValue={user?.fullname}
              disabled
              className="w-full border bg-tile-warm rounded-lg px-3 py-2.5 text-sm text-ink-soft cursor-not-allowed"
            />
            <p className="text-xs text-ink-faint mt-1">Liên hệ hỗ trợ để thay đổi họ tên</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Số Điện Thoại</label>
            <input
              {...register("phone")}
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Giới Tính</label>
            <select
              {...register("gender")}
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-ink hover:bg-black disabled:bg-ink/40 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-ink-soft mb-4">Đổi Mật Khẩu</h2>
        <form onSubmit={submitPw(onPassword)} className="space-y-4">
          {[
            { name: "old_password", label: "Mật Khẩu Hiện Tại" },
            { name: "new_password", label: "Mật Khẩu Mới" },
            { name: "new_password_confirmation", label: "Xác Nhận Mật Khẩu Mới" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-ink-soft mb-1">{label}</label>
              <input
                {...regPw(name)}
                type="password"
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15"
              />
              {pwErrors[name] && <p className="text-red-500 text-xs mt-1">{pwErrors[name].message}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={pwSaving}
            className="bg-ink hover:bg-black disabled:bg-ink/40 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {pwSaving ? "Đang đổi..." : "Đổi Mật Khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
