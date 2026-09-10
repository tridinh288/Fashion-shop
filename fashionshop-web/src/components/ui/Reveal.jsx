import { motion } from "framer-motion";

/**
 * Bọc quanh một khối để nó nhẹ nhàng hiện lên khi cuộn tới.
 * Chỉ chạy một lần, và chạy sớm trước khi khối vào giữa màn hình
 * để người dùng không thấy khoảng trống chờ hiệu ứng.
 */
export default function Reveal({ children, delay = 0, y = 20, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
