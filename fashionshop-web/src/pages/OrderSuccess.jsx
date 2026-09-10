import { Link, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle size={80} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">Đặt Hàng Thành Công!</h1>
        <p className="text-ink-soft mb-2">Cảm ơn bạn đã mua sắm tại FashionShop</p>
        {id && (
          <p className="text-sm text-ink-faint mb-8">
            Mã đơn hàng: <span className="font-semibold text-ink-soft">#{id}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/orders/${id}`}
            className="bg-ink hover:bg-black text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Xem Chi Tiết Đơn
          </Link>
          <Link
            to="/"
            className="border border-line hover:bg-tile-warm text-ink-soft font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
