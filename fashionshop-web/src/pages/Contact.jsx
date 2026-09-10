import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { sendContact } from "../api/contactApi";

const schema = z.object({
  fullname: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  message: z.string().min(10, "Nội dung tối thiểu 10 ký tự"),
});

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await sendContact(data);
      toast.success("Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm.");
      reset();
    } catch {
      toast.error("Gửi thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-ink mb-2 text-center">Liên Hệ</h1>
      <p className="text-center text-ink-soft mb-10">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-tile p-3 rounded-xl shrink-0">
              <MapPin size={20} className="text-ink" />
            </div>
            <div>
              <p className="font-semibold text-ink">Địa chỉ</p>
              <p className="text-ink-soft text-sm">123 Đường Thời Trang, Quận 1, TP.HCM</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-tile p-3 rounded-xl shrink-0">
              <Phone size={20} className="text-ink" />
            </div>
            <div>
              <p className="font-semibold text-ink">Điện thoại</p>
              <p className="text-ink-soft text-sm">0901 234 567</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-tile p-3 rounded-xl shrink-0">
              <Mail size={20} className="text-ink" />
            </div>
            <div>
              <p className="font-semibold text-ink">Email</p>
              <p className="text-ink-soft text-sm">support@fashionshop.vn</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1">Họ và Tên</label>
              <input
                {...register("fullname")}
                placeholder="Nguyễn Văn A"
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15"
              />
              {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1">Email</label>
              <input
              {...register("email")}
              name="email"
              type="text"
              autoComplete="off"
              placeholder="email@example.com"
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15"
            />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-soft mb-1">Nội Dung</label>
              <textarea
                {...register("message")}
                rows={5}
                placeholder="Nội dung tin nhắn..."
                className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink/15 resize-none"
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink hover:bg-black disabled:bg-ink/40 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? "Đang gửi..." : "Gửi Liên Hệ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
