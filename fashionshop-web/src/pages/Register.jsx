import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { register as registerApi } from "../api/authApi";
import useAuthStore from "../stores/authStore";
import AuthShell from "../components/layout/AuthShell";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { INPUT_CLASS } from "../components/ui/fieldStyles";

// Backend validate: phone 9-11 digits, password min 6, gender in ['Nam','Nữ']
const schema = z.object({
  fullname: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^\d{9,11}$/, "Số điện thoại 9-11 chữ số"),
  gender: z.enum(["Nam", "Nữ"]),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["password_confirmation"],
});

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { gender: "Nam" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerApi(data);
      // Backend trả về: { message, user, token }
      const { user, token } = res.data;
      setAuth(user, token);
      toast.success("Đăng ký thành công!");
      navigate("/");
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) {
        Object.values(errs).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.response?.data?.message || "Đăng ký thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = "text", placeholder = "", extra = {}) => (
    <Field label={label} error={errors[name]?.message}>
      <input
        {...register(name)}
        type={type}
        autoComplete="off"
        placeholder={placeholder}
        className={INPUT_CLASS}
        {...extra}
      />
    </Field>
  );

  return (
    <AuthShell
      eyebrow="Tài khoản mới"
      title="Đăng ký"
      subtitle="Tạo tài khoản để đặt hàng và theo dõi đơn."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {field("fullname", "Họ và tên", "text", "Nguyễn Văn A")}
        {field("email", "Email", "text", "email@example.com", { inputMode: "email" })}

        <div className="grid gap-5 sm:grid-cols-2">
          {field("phone", "Số điện thoại", "text", "0901234567", { inputMode: "numeric" })}
          <Field label="Giới tính">
            <select {...register("gender")} className={INPUT_CLASS}>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </Field>
        </div>

        {field("password", "Mật khẩu", "password", "Tối thiểu 6 ký tự")}
        {field("password_confirmation", "Xác nhận mật khẩu", "password", "Nhập lại mật khẩu")}

        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Đăng ký
        </Button>
      </form>
    </AuthShell>
  );
}
