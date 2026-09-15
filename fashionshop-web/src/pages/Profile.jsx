import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { updateProfile, changePassword } from "../api/profileApi";
import useAuthStore from "../stores/authStore";
import AccountNav from "../components/layout/AccountNav";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import Field from "../components/ui/Field";
import { INPUT_CLASS } from "../components/ui/fieldStyles";
import SectionHeading from "../components/ui/SectionHeading";

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

const PW_FIELDS = [
  { name: "old_password", label: "Mật khẩu hiện tại", autoComplete: "current-password" },
  { name: "new_password", label: "Mật khẩu mới", autoComplete: "new-password" },
  { name: "new_password_confirmation", label: "Xác nhận mật khẩu mới", autoComplete: "new-password" },
];

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
    <Container className="py-10 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <SectionHeading as="h1" eyebrow="Tài khoản" title="Hồ sơ cá nhân" className="mb-8" />
        <AccountNav />

        <section className="grid gap-8 border-b border-line pb-12 md:grid-cols-[240px_1fr]">
          <div>
            <h2 className="font-display text-2xl text-ink">Thông tin cá nhân</h2>
            <p className="mt-2 text-sm text-ink-soft">Email, số điện thoại và giới tính dùng khi giao hàng.</p>
          </div>
          <form onSubmit={handleSubmit(onProfile)} className="flex flex-col gap-5">
            <Field label="Họ và tên" hint="Liên hệ hỗ trợ để thay đổi họ tên">
              <input
                defaultValue={user?.fullname}
                disabled
                className={`${INPUT_CLASS} cursor-not-allowed bg-tile text-ink-soft`}
              />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} type="email" autoComplete="email" className={INPUT_CLASS} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Số điện thoại" error={errors.phone?.message}>
                <input {...register("phone")} inputMode="numeric" autoComplete="tel" className={INPUT_CLASS} />
              </Field>
              <Field label="Giới tính">
                <select {...register("gender")} className={INPUT_CLASS}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </Field>
            </div>
            <div>
              <Button type="submit" loading={saving}>Lưu thay đổi</Button>
            </div>
          </form>
        </section>

        <section className="grid gap-8 pt-12 md:grid-cols-[240px_1fr]">
          <div>
            <h2 className="font-display text-2xl text-ink">Đổi mật khẩu</h2>
            <p className="mt-2 text-sm text-ink-soft">Mật khẩu mới tối thiểu 6 ký tự.</p>
          </div>
          <form onSubmit={submitPw(onPassword)} className="flex flex-col gap-5">
            {PW_FIELDS.map(({ name, label, autoComplete }) => (
              <Field key={name} label={label} error={pwErrors[name]?.message}>
                <input
                  {...regPw(name)}
                  type="password"
                  autoComplete={autoComplete}
                  placeholder="••••••••"
                  className={INPUT_CLASS}
                />
              </Field>
            ))}
            <div>
              <Button type="submit" variant="secondary" loading={pwSaving}>Đổi mật khẩu</Button>
            </div>
          </form>
        </section>
      </div>
    </Container>
  );
}
