const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/**
 * Đổi giá trị ảnh từ API thành src cho <img>.
 * Ảnh mới là URL Cloudinary đầy đủ thì dùng nguyên; ảnh mẫu cũ là đường dẫn
 * tương đối trên API thì ghép với /storage/.
 */
export function imageUrl(ref) {
  if (!ref) return null;
  return /^https?:\/\//i.test(ref) ? ref : `${API_URL}/storage/${ref}`;
}
