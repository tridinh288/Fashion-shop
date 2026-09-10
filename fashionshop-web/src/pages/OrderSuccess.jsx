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
        <h1 className="text-2xl font-bold text-neutral-100 mb-2">Đặt Hàng Thành Công!</h1>
        <p className="text-neutral-500 mb-2">Cảm ơn bạn đã mua sắm tại FashionShop</p>
        {id && (
          <p className="text-sm text-neutral-600 mb-8">
            Mã đơn hàng: <span className="font-semibold text-neutral-300">#{id}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={`/orders/${id}`}
            className="bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 transition-colors"
          >
            Xem Chi Tiết Đơn
          </Link>
          <Link
            to="/"
            className="border border-line hover:bg-ink text-neutral-300 font-semibold px-6 py-3 transition-colors"
          >
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
