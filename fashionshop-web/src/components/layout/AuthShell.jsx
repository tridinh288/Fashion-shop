import Container from "../ui/Container";

/** Khung chung cho Đăng nhập / Đăng ký: cột hẹp giữa trang, tiêu đề serif */
export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <Container className="flex justify-center py-14 sm:py-20">
      <div className="w-full max-w-md">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-ink-soft">{subtitle}</p>}
        <div className="mt-10">{children}</div>
        {footer && <p className="mt-8 border-t border-line pt-6 text-sm text-ink-soft">{footer}</p>}
      </div>
    </Container>
  );
}
