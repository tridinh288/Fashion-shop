import { useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-lg text-center">
        <CheckCircle2 size={48} strokeWidth={1.25} className="mx-auto text-accent" aria-hidden="true" />
        <p className="eyebrow mt-8">Cảm ơn bạn</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Đặt hàng thành công</h1>
        <p className="mt-4 text-ink-soft">
          Đơn hàng đã được ghi nhận. Chúng tôi sẽ liên hệ xác nhận trước khi giao.
        </p>
        {id && (
          <p className="mt-2 text-sm text-ink-faint">
            Mã đơn hàng: <span className="font-medium text-ink">#{id}</span>
          </p>
        )}
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to={`/orders/${id}`} size="lg">Xem chi tiết đơn</Button>
          <Button to="/" variant="secondary" size="lg">Tiếp tục mua sắm</Button>
        </div>
      </div>
    </Container>
  );
}
