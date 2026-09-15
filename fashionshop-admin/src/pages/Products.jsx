import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/productApi";
import { getCategories } from "../api/categoryApi";
import { formatCurrency } from "../utils/formatCurrency";
import { imageUrl } from "../utils/imageUrl";
import Spinner from "../components/ui/Spinner";
import Pagination from "../components/ui/Pagination";

const EMPTY_FORM = {
  ten_sp: "", gia: "", gia_cu: "", mo_ta: "", so_luong: "",
  gioi_tinh: "1", category_id: "", hinh_anh: null,
};

export default function Products() {
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [keyword, setKeyword]   = useState("");
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [preview, setPreview]   = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, search],
    queryFn: () => getProducts({ page, keyword: search || undefined }),
  });

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const products  = data?.data?.data || [];
  const meta      = data?.data;
  const categories = Array.isArray(catData?.data)
  ? catData.data
  : Array.isArray(catData?.data?.data)
    ? catData.data.data
    : [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-products"] });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPreview(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ten_sp: p.ten_sp, gia: p.gia, gia_cu: p.gia_cu || "",
      mo_ta: p.mo_ta || "", so_luong: p.so_luong,
      gioi_tinh: String(p.gioi_tinh), category_id: p.category_id || "",
      hinh_anh: null,
    });
    setPreview(p.hinh_anh ? imageUrl(p.hinh_anh) : null);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setPreview(null); };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, hinh_anh: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.ten_sp || !form.gia || !form.so_luong) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "hinh_anh") { if (v) fd.append(k, v); }
      else if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
    });
    try {
      if (editing) {
        await updateProduct(editing.id, fd);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await createProduct(fd);
        toast.success("Đã thêm sản phẩm");
      }
      closeForm();
      invalidate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id);
      toast.success("Đã xóa sản phẩm");
      invalidate();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sản Phẩm</h1>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Thêm Sản Phẩm
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-5">
        <div className="flex items-center border bg-white rounded-lg px-3 gap-2 flex-1 max-w-xs">
          <Search size={15} className="text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(keyword); setPage(1); } }}
            placeholder="Tìm sản phẩm..."
            className="py-2 text-sm outline-none w-full"
          />
        </div>
        <button onClick={() => { setSearch(keyword); setPage(1); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Tìm
        </button>
      </div>

      {/* Table */}
      {isLoading ? <Spinner /> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Sản Phẩm</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Danh Mục</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Giá</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tồn Kho</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Giới Tính</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.hinh_anh ? imageUrl(p.hinh_anh) : "https://placehold.co/40x40?text=SP"}
                        alt={p.ten_sp}
                        className="w-10 h-10 object-cover rounded-lg border"
                      />
                      <span className="font-medium text-gray-800 line-clamp-2 max-w-48">{p.ten_sp}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.ten_danh_muc || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(p.gia)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.so_luong}</td>
                  <td className="px-4 py-3 text-gray-500">{p.gioi_tinh == 1 ? "Nam" : "Nữ"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center py-10 text-gray-400">Không có sản phẩm</p>}
        </div>
      )}

      <Pagination meta={meta} onPage={setPage} />

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-800">{editing ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm"}</h2>
              <button onClick={closeForm} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình Ảnh</label>
                {preview && <img src={preview} alt="" className="w-24 h-24 object-cover rounded-lg border mb-2" />}
                <input type="file" accept="image/*" onChange={handleFile} className="text-sm text-gray-500" />
              </div>

              {[
                { key: "ten_sp",   label: "Tên Sản Phẩm *",      type: "text"   },
                { key: "gia",      label: "Giá Bán (VNĐ) *",     type: "number" },
                { key: "gia_cu",   label: "Giá Cũ (VNĐ)",         type: "number" },
                { key: "so_luong", label: "Số Lượng Tồn Kho *",   type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh Mục</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.ten_danh_muc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới Tính</label>
                <select
                  value={form.gioi_tinh}
                  onChange={(e) => setForm((f) => ({ ...f, gioi_tinh: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="1">Nam</option>
                  <option value="0">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô Tả</label>
                <textarea
                  value={form.mo_ta}
                  onChange={(e) => setForm((f) => ({ ...f, mo_ta: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button onClick={closeForm} className="border text-gray-600 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
