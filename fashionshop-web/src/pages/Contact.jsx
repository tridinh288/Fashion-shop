import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { sendContact } from "../api/contactApi";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import Field from "../components/ui/Field";
import { INPUT_CLASS } from "../components/ui/fieldStyles";

const schema = z.object({
  fullname: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  message: z.string().min(10, "Nội dung tối thiểu 10 ký tự"),
});

const INFO = [
  { icon: MapPin, label: "Địa chỉ", value: "123 Đường Thời Trang, Quận 1, TP.HCM" },
  { icon: Phone, label: "Điện thoại", value: "0901 234 567" },
  { icon: Mail, label: "Email", value: "support@fashionshop.vn" },
];

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
    <Container className="py-14 lg:py-20">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">Hỗ trợ</p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-ink sm:text-6xl">Liên hệ</h1>
          <p className="mt-5 max-w-md text-ink-soft">
            Hỏi về size, đơn hàng hay đổi trả — để lại lời nhắn, chúng tôi phản hồi trong ngày làm việc.
          </p>

          <dl className="mt-12 flex flex-col divide-y divide-line border-y border-line">
            {INFO.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-5">
                <Icon size={18} strokeWidth={1.5} className="shrink-0 text-ink" aria-hidden="true" />
                <dt className="w-24 shrink-0 text-sm text-ink-faint">{label}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 lg:pt-4">
          <Field label="Họ và tên" error={errors.fullname?.message}>
            <input {...register("fullname")} placeholder="Nguyễn Văn A" autoComplete="name" className={INPUT_CLASS} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="text"
              inputMode="email"
              autoComplete="off"
              placeholder="email@example.com"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Nội dung" error={errors.message?.message}>
            <textarea
              {...register("message")}
              rows={6}
              placeholder="Bạn cần chúng tôi hỗ trợ điều gì?"
              className={`${INPUT_CLASS} resize-none`}
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Gửi liên hệ
          </Button>
        </form>
      </div>
    </Container>
  );
}
