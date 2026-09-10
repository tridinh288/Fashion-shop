import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { login } from "../api/authApi";
import { getCart } from "../api/cartApi";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { setCount } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");

    try {
      const res = await login(data);
      const { user, token } = res.data;

      setAuth(user, token);

      try {
        const cartRes = await getCart();
        setCount(cartRes.data?.data?.length || 0);
      } catch (err) {
        // Log lỗi để ESLint hiểu là biến 'err' đã được sử dụng
        console.error("Lỗi khi lấy giỏ hàng:", err);
      }

      toast.success("Đăng nhập thành công!");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setServerError("Email hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="bg-ink-1 border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-neutral-100 mb-1">
          Đăng Nhập
        </h1>

        <p className="text-sm text-neutral-500 mb-6">
          Chào mừng bạn trở lại FashionShop
        </p>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="email@example.com"
            className="w-full border px-3 py-2.5"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">
              {errors.email.message}
            </p>
          )}

          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="w-full border px-3 py-2.5"
          />
          {errors.password && (
            <p className="text-red-500 text-xs">
              {errors.password.message}
            </p>
          )}

          {/* 🔥 FIX CHO TEST */}
          {serverError && (
            <p className="text-red-500 text-sm font-medium">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2.5"
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <p className="text-sm text-center text-neutral-500 mt-6">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-accent">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}