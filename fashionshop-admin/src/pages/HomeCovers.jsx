import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, ImageOff } from "lucide-react";
import toast from "react-hot-toast";
import { getHomeCovers, updateHomeCovers, deleteHomeCover } from "../api/homeCoverApi";
import { IMG_BASE } from "../utils/constants";
import Spinner from "../components/ui/Spinner";

const COLLECTIONS = [
  { key: "nam", title: "Thời Trang Nam", desc: "Ô bên trái ở khu Bộ sưu tập ngoài trang chủ" },
  { key: "nu", title: "Thời Trang Nữ", desc: "Ô bên phải ở khu Bộ sưu tập ngoài trang chủ" },
];

export default function HomeCovers() {
  const qc = useQueryClient();
  const [pending, setPending] = useState({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["home-covers"],
    queryFn: getHomeCovers,
  });

  const covers = data?.data?.data ?? {};

  const pickFile = (key, file) => {
    if (!file) return;
    setPending((p) => ({ ...p, [key]: { file, preview: URL.createObjectURL(file) } }));
  };

  const handleSave = async () => {
    const keys = Object.keys(pending);
    if (keys.length === 0) {
      toast.error("Chưa chọn ảnh nào");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    keys.forEach((k) => fd.append(k, pending[k].file));

    try {
      await updateHomeCovers(fd);
      toast.success("Đã cập nhật ảnh trang chủ");
      setPending({});
      qc.invalidateQueries({ queryKey: ["home-covers"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key) => {
    if (!confirm("Gỡ ảnh này? Trang chủ sẽ quay lại dùng ảnh một sản phẩm đang bán.")) return;
    try {
      await deleteHomeCover(key);
      toast.success("Đã gỡ ảnh");
      qc.invalidateQueries({ queryKey: ["home-covers"] });
    } catch {
      toast.error("Gỡ ảnh thất bại");
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Ảnh Trang Chủ</h1>
      <p className="text-sm text-gray-500 mb-6">
        Đặt ảnh cho hai ô bộ sưu tập ngoài trang khách. Để trống thì trang chủ tự
        lấy ảnh của một sản phẩm đang bán.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        {COLLECTIONS.map(({ key, title, desc }) => {
          const current = covers[key];
          const preview = pending[key]?.preview;
          const shown = preview || (current ? `${IMG_BASE}${current}` : null);

          return (
            <div key={key} className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b">
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>

              <div className="p-5">
                <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                  {shown ? (
                    <img src={shown} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageOff size={28} className="mx-auto mb-2" />
                      <p className="text-xs">Chưa đặt ảnh</p>
                    </div>
                  )}
                </div>

                {preview && (
                  <p className="text-xs text-amber-600 mb-3">
                    Ảnh mới đang chờ lưu. Bấm &quot;Lưu thay đổi&quot; để áp dụng.
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors">
                    <Upload size={15} />
                    Chọn ảnh
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => pickFile(key, e.target.files[0])}
                    />
                  </label>

                  {current && (
                    <button
                      onClick={() => handleDelete(key)}
                      className="inline-flex items-center gap-1.5 border text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Trash2 size={15} />
                      Gỡ ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving || Object.keys(pending).length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
