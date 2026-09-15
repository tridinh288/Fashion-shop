import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, MessageSquare, Star } from "lucide-react";
import toast from "react-hot-toast";
import { getReviews, replyReview, deleteReview } from "../api/reviewApi";
import { imageUrl } from "../utils/imageUrl";
import Spinner from "../components/ui/Spinner";
import Pagination from "../components/ui/Pagination";

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={13} className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const qc           = useQueryClient();
  const [page, setPage]     = useState(1);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", page],
    queryFn: () => getReviews({ page }),
  });

  const reviews = data?.data?.data || [];
  const meta    = data?.data;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-reviews"] });

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      await replyReview(id, replyText.trim());
      toast.success("Đã phản hồi đánh giá");
      setReplyId(null);
      setReplyText("");
      invalidate();
    } catch {
      toast.error("Phản hồi thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa đánh giá này?")) return;
    try {
      await deleteReview(id);
      toast.success("Đã xóa đánh giá");
      invalidate();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đánh Giá</h1>

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  {/* Product */}
                  <img
                    src={r.product?.hinh_anh ? imageUrl(r.product.hinh_anh) : "https://placehold.co/48x48?text=SP"}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg border shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">{r.product?.ten_sp}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRow rating={r.rating} />
                      <span className="text-xs text-gray-400">bởi <span className="font-medium text-gray-600">{r.user?.fullname}</span></span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <p className="text-sm text-gray-700">{r.comment}</p>

                    {/* Shop reply */}
                    {r.shop_reply && (
                      <div className="mt-2 bg-blue-50 border-l-2 border-blue-400 pl-3 py-1.5 rounded-r">
                        <p className="text-xs text-blue-600 font-semibold mb-0.5">Phản hồi cửa hàng:</p>
                        <p className="text-sm text-gray-700">{r.shop_reply}</p>
                      </div>
                    )}

                    {/* Reply form */}
                    {replyId === r.id && (
                      <div className="mt-3 flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          placeholder="Nhập phản hồi..."
                          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                          autoFocus
                        />
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleReply(r.id)} disabled={saving} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">Gửi</button>
                          <button onClick={() => { setReplyId(null); setReplyText(""); }} className="border text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50">Hủy</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setReplyId(r.id); setReplyText(r.shop_reply || ""); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Phản hồi"
                  >
                    <MessageSquare size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-center py-10 text-gray-400">Không có đánh giá</p>}
        </div>
      )}

      <Pagination meta={meta} onPage={setPage} />
    </div>
  );
}
