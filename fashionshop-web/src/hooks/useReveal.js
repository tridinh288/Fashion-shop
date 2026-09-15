import { gsap, useGSAP } from "../lib/gsap";

/**
 * Cho các phần tử khớp `selector` bên trong scopeRef hiện dần lên.
 *
 * - Chỉ chạy khi người dùng không bật giảm chuyển động.
 * - Không ẩn sẵn bằng CSS: GSAP chỉ đặt trạng thái ẩn ngay trước khi chạy,
 *   nên JS lỗi hay tắt hiệu ứng thì nội dung vẫn hiện đầy đủ.
 * - `onLoad` chạy ngay khi gắn (hero); mặc định chờ khối cuộn tới.
 * - `dependencies` đổi (dữ liệu tải xong, đổi tab) thì chạy lại cho phần tử mới.
 */
export default function useReveal(
  scopeRef,
  { selector = "[data-reveal]", stagger = 0.05, onLoad = false, dependencies = [] } = {}
) {
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = gsap.utils.toArray(selector, scope);
        if (targets.length === 0) return;

        gsap.from(targets, {
          opacity: 0,
          y: 12,
          duration: 0.35,
          ease: "power1.out",
          stagger,
          ...(onLoad
            ? {}
            : { scrollTrigger: { trigger: scope, start: "top 85%", once: true } }),
        });
      });

      return () => mm.revert();
    },
    { scope: scopeRef, dependencies, revertOnUpdate: true }
  );
}
