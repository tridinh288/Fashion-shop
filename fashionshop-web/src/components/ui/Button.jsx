import { Link } from "react-router-dom";

const BASE =
  "inline-flex items-center justify-center gap-2 text-[13px] font-semibold tracking-[0.02em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  primary: "bg-ink px-6 text-white hover:bg-black",
  secondary: "border border-ink px-6 text-ink hover:bg-ink hover:text-white",
  link: "text-ink underline decoration-1 underline-offset-4 hover:text-accent",
};

const SIZES = {
  md: "min-h-11",
  lg: "min-h-13 px-8",
};

/**
 * Nút dùng chung. Chữ giữ nguyên hoa/thường như viết (không in hoa bằng CSS)
 * để test E2E tìm theo nội dung vẫn khớp.
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  to,
  type = "button",
  className = "",
  disabled,
  children,
  ...rest
}) {
  const cls = [BASE, VARIANTS[variant], variant === "link" ? "" : SIZES[size], className]
    .filter(Boolean)
    .join(" ");
  const content = loading ? "Đang xử lý…" : children;

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
