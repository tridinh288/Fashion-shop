import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, LogOut, ChevronDown, Package } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import { logout as logoutApi } from "../../api/authApi";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { label: "Trang Chủ", to: "/" },
  { label: "Nam", to: "/category?gioi_tinh=1" },
  { label: "Nữ", to: "/category?gioi_tinh=0" },
  { label: "Liên Hệ", to: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { user, token, logout } = useAuthStore();
  const count = useCartStore((s) => s.count);

  const currentPath = pathname + search;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ("");
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch { /* bỏ qua lỗi mạng, vẫn đăng xuất phía client */ }
    logout();
    setUserMenuOpen(false);
    navigate("/");
    toast.success("Đã đăng xuất");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
            <span className="text-[15px] font-bold tracking-tight text-white">
              FASHION<span className="text-zinc-500">SHOP</span>
            </span>
          </Link>

          {/* Điều hướng desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => {
              const active = currentPath === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                    active ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {l.label}
                  {active && <span className="absolute inset-x-3 -bottom-px h-px bg-accent" />}
                </Link>
              );
            })}
          </nav>

          {/* Tìm kiếm */}
          <form
            onSubmit={handleSearch}
            className="hidden w-64 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 transition-all duration-300 focus-within:border-accent/50 focus-within:bg-zinc-900 md:flex"
          >
            <Search size={15} className="shrink-0 text-zinc-500" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            />
          </form>

          {/* Nhóm nút bên phải */}
          <div className="flex items-center gap-2">
            <Link
              to={token ? "/cart" : "/login"}
              className="relative rounded-lg p-2 text-zinc-400 transition-colors duration-300 hover:bg-zinc-900 hover:text-white"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              {token && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {token ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-zinc-300 transition-colors duration-300 hover:bg-zinc-900 hover:text-white"
                >
                  <User size={18} strokeWidth={1.8} />
                  <span className="hidden max-w-24 truncate md:block">
                    {user?.fullname?.split(" ").pop()}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    {/* Bấm ra ngoài để đóng menu */}
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-2xl shadow-black/50">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 transition-colors duration-200 hover:bg-zinc-800 hover:text-white"
                      >
                        <User size={15} /> Hồ Sơ
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-300 transition-colors duration-200 hover:bg-zinc-800 hover:text-white"
                      >
                        <Package size={15} /> Đơn Hàng
                      </Link>
                      <div className="my-1 h-px bg-zinc-800" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 transition-colors duration-200 hover:bg-zinc-800"
                      >
                        <LogOut size={15} /> Đăng Xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:bg-accent hover:text-white md:block"
              >
                Đăng Nhập
              </Link>
            )}

            <button
              className="rounded-lg p-2 text-zinc-400 transition-colors duration-300 hover:bg-zinc-900 hover:text-white md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu di động */}
        {menuOpen && (
          <div className="space-y-1 border-t border-zinc-800 py-4 md:hidden">
            <form
              onSubmit={handleSearch}
              className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2"
            >
              <Search size={15} className="text-zinc-500" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
              />
            </form>

            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors duration-300 hover:bg-zinc-900 hover:text-white"
              >
                {l.label}
              </Link>
            ))}

            {!token && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 block rounded-xl bg-white px-3 py-2.5 text-center text-sm font-semibold text-zinc-950"
              >
                Đăng Nhập / Đăng Ký
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
