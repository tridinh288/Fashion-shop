import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, ImageOff, Move, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { getHomeCovers, updateHomeCovers, deleteHomeCover } from "../api/homeCoverApi";
import { IMG_BASE } from "../utils/constants";
import Spinner from "../components/ui/Spinner";

const SLOTS = [
  {
    key: "hero",
    title: "Ảnh Đầu Trang",
    desc: "Ảnh lớn bên phải phần mở đầu",
    aspect: "aspect-[4/5]",
    tall: true,
  },
  { key: "nam", title: "Thời Trang Nam", desc: "Ô bên trái khu Bộ sưu tập", aspect: "aspect-[16/9]" },
  { key: "nu", title: "Thời Trang Nữ", desc: "Ô bên phải khu Bộ sưu tập", aspect: "aspect-[16/9]" },
];

const DEFAULT_POS = "50% 50%";

/** "50% 40%" -> { x: 50, y: 40 } */
function parsePos(pos) {
  const m = /^\s*([\d.]+)%\s+([\d.]+)%\s*$/.exec(pos || "");
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 50, y: 50 };
}

const clamp = (n) => Math.min(100, Math.max(0, n));

/**
 * Khung xem trước cho phép kéo ảnh để chọn phần hiển thị.
 * Chỉ kéo được khi đang ở chế độ phủ kín, vì ở chế độ vừa khung
 * toàn bộ ảnh đã nằm trong khung nên không có gì để dịch chuyển.
 */
function CoverPreview({ src, fit, pos, onPosChange, aspect }) {
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const draggable = fit === "cover" && Boolean(src);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;

      // Kéo xuống thì lộ phần trên của ảnh, nên toạ độ Y giảm
      const dx = ((e.clientX - d.startX) / d.width) * 100;
      const dy = ((e.clientY - d.startY) / d.height) * 100;

      onPosChange({ x: clamp(d.startPos.x - dx), y: clamp(d.startPos.y - dy) });
    };

    const onUp = () => setDragging(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, onPosChange]);

  const startDrag = (e) => {
    if (!draggable) return;
    const rect = frameRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      width: rect.width,
      height: rect.height,
      startPos: parsePos(pos),
    };
    setDragging(true);
  };

  return (
    <div
      ref={frameRef}
      onPointerDown={startDrag}
      className={`${aspect} relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center select-none ${
        draggable ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
      }`}
    >
      {src ? (
        <>
          <img
            src={src}
            alt=""
            draggable={false}
            className="w-full h-full pointer-events-none"
            style={{ objectFit: fit, objectPosition: pos }}
          />
          {draggable && !dragging && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-full">
              <Move size={12} /> Kéo để chỉnh vị trí
            </span>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400">
          <ImageOff size={26} className="mx-auto mb-2" />
          <p className="text-xs">Chưa đặt ảnh</p>
        </div>
      )}
    </div>
  );
}

export default function HomeCovers() {
  const qc = useQueryClient();
  const [pending, setPending] = useState({});
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["home-covers"],
    queryFn: getHomeCovers,
  });

  const covers = data?.data?.data ?? {};

  /** Thiết lập đang hiển thị: bản chỉnh chưa lưu đè lên bản đã lưu */
  const settingOf = (key) => ({
    fit: edits[key]?.fit ?? covers[key]?.fit ?? "cover",
    pos: edits[key]?.pos ?? covers[key]?.pos ?? DEFAULT_POS,
  });

  const srcOf = (key) =>
    pending[key]?.preview || (covers[key]?.path ? `${IMG_BASE}${covers[key].path}` : null);

  const setEdit = (key, patch) =>
    setEdits((e) => ({ ...e, [key]: { ...settingOf(key), ...patch } }));

  const pickFile = (key, file) => {
    if (!file) return;
    setPending((p) => ({ ...p, [key]: { file, preview: URL.createObjectURL(file) } }));
  };

  const dirty = Object.keys(pending).length > 0 || Object.keys(edits).length > 0;

  const handleSave = async () => {
    if (!dirty) {
      toast.error("Chưa có thay đổi nào");
      return;
    }

    setSaving(true);
    const fd = new FormData();

    Object.keys(pending).forEach((k) => fd.append(k, pending[k].file));
    Object.keys(edits).forEach((k) => {
      fd.append(`${k}_fit`, edits[k].fit);
      fd.append(`${k}_pos`, edits[k].pos);
    });

    // Ảnh mới chưa từng chỉnh thì vẫn gửi kèm thiết lập mặc định để đồng bộ
    Object.keys(pending).forEach((k) => {
      if (!edits[k]) {
        const s = settingOf(k);
        fd.append(`${k}_fit`, s.fit);
        fd.append(`${k}_pos`, s.pos);
      }
    });

    try {
      await updateHomeCovers(fd);
      toast.success("Đã cập nhật ảnh trang chủ");
      setPending({});
      setEdits({});
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
      setPending((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      setEdits((e) => {
        const n = { ...e };
        delete n[key];
        return n;
      });
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
        Đặt ảnh cho phần mở đầu và hai ô bộ sưu tập ngoài trang khách. Ô nào để
        trống thì trang chủ tự lấy ảnh của một sản phẩm đang bán.
      </p>

      <div className="grid gap-5 lg:grid-cols-3">
        {SLOTS.map(({ key, title, desc, aspect, tall }) => {
          const src = srcOf(key);
          const { fit, pos } = settingOf(key);

          return (
            <div
              key={key}
              className={`bg-white rounded-xl border overflow-hidden ${tall ? "lg:row-span-2" : ""}`}
            >
              <div className="px-5 py-4 border-b">
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>

              <div className="p-5">
                <CoverPreview
                  src={src}
                  fit={fit}
                  pos={pos}
                  aspect={aspect}
                  onPosChange={({ x, y }) => setEdit(key, { pos: `${Math.round(x)}% ${Math.round(y)}%` })}
                />

                {src && (
                  <div className="mt-4 space-y-3">
                    {/* Cách lấp khung */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                      {[
                        { v: "cover", label: "Phủ kín" },
                        { v: "contain", label: "Vừa khung" },
                      ].map(({ v, label }) => (
                        <button
                          key={v}
                          onClick={() => setEdit(key, { fit: v })}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                            fit === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {fit === "cover" && (
                      <>
                        {/* Thanh trượt cho ai muốn chỉnh chính xác thay vì kéo */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-gray-500 w-8 shrink-0">Dọc</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parsePos(pos).y}
                            onChange={(e) =>
                              setEdit(key, { pos: `${parsePos(pos).x}% ${e.target.value}%` })
                            }
                            className="flex-1"
                          />
                          <span className="text-[11px] tabular-nums text-gray-500 w-9 text-right shrink-0">
                            {Math.round(parsePos(pos).y)}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] text-gray-500 w-8 shrink-0">Ngang</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={parsePos(pos).x}
                            onChange={(e) =>
                              setEdit(key, { pos: `${e.target.value}% ${parsePos(pos).y}%` })
                            }
                            className="flex-1"
                          />
                          <span className="text-[11px] tabular-nums text-gray-500 w-9 text-right shrink-0">
                            {Math.round(parsePos(pos).x)}%
                          </span>
                        </div>

                        {pos !== DEFAULT_POS && (
                          <button
                            onClick={() => setEdit(key, { pos: DEFAULT_POS })}
                            className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-800 transition-colors"
                          >
                            <RotateCcw size={12} /> Về giữa
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  <label className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors">
                    <Upload size={15} />
                    {src ? "Đổi ảnh" : "Chọn ảnh"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => pickFile(key, e.target.files[0])}
                    />
                  </label>

                  {covers[key]?.path && (
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

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {dirty && <span className="text-xs text-amber-600">Có thay đổi chưa lưu</span>}
      </div>
    </div>
  );
}
