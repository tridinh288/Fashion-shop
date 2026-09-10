import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { register as registerApi } from "../api/authApi";
import useAuthStore from "../stores/authStore";

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

  const field = (name, label, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-ink-soft mb-1">{label}</label>
      <input
      {...register(name)}
      name={name}
      type={type}
      autoComplete="off"
      placeholder={placeholder}
      className="w-full border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15"
    />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-tile-warm flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink mb-1">Đăng Ký</h1>
        <p className="text-sm text-ink-soft mb-6">Tạo tài khoản FashionShop mới</p>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {field("fullname", "Họ và Tên", "text", "Nguyễn Văn A")}
          {field("email", "Email", "text", "email@example.com")}
          {field("phone", "Số Điện Thoại", "text", "0901234567")}

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">Giới Tính</label>
            <select
              {...register("gender")}
              className="w-full border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          {field("password", "Mật Khẩu", "password", "Tối thiểu 6 ký tự")}
          {field("password_confirmation", "Xác Nhận Mật Khẩu", "password", "Nhập lại mật khẩu")}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink hover:bg-black disabled:bg-ink/40 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Đang đăng ký..." : "Đăng Ký"}
          </button>
        </form>

        <p className="text-sm text-center text-ink-soft mt-6">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-ink font-medium hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
