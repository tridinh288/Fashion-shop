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
import AuthShell from "../components/layout/AuthShell";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { INPUT_CLASS } from "../components/ui/fieldStyles";

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
    <AuthShell
      eyebrow="Tài khoản"
      title="Đăng nhập"
      subtitle="Chào mừng bạn trở lại Fashion Shop."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="email@example.com"
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Mật khẩu" error={errors.password?.message}>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={INPUT_CLASS}
          />
        </Field>

        {serverError && (
          <p role="alert" className="border-l-2 border-sale pl-3 text-sm text-sale">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Đăng nhập
        </Button>
      </form>
    </AuthShell>
  );
}
