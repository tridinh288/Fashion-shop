/** Khung nội dung rộng tối đa 1400px với lề hai bên thống nhất */
export default function Container({ as: Tag = "div", className = "", children }) {
  return <Tag className={`mx-auto w-full max-w-[1400px] px-5 lg:px-8 ${className}`}>{children}</Tag>;
}
