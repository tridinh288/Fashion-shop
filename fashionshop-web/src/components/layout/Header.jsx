import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, LogOut, Package } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import { logout as logoutApi } from "../../api/authApi";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { label: "Trang chủ", to: "/" },
  { label: "Nam", to: "/category?gioi_tinh=1" },
  { label: "Nữ", to: "/category?gioi_tinh=0" },
  { label: "Liên hệ", to: "/contact" },
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
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex h-[72px] items-center justify-between gap-8">
          <Link
            to="/"
            className="shrink-0 font-display text-xl font-medium tracking-[0.02em] text-white"
          >
            Fashion<span className="text-accent">Shop</span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((l) => {
              const active = currentPath === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`link-underline text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                    active ? "text-accent" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5">
            <form
              onSubmit={handleSearch}
              className="hidden w-52 items-center gap-2.5 border-b border-line pb-1.5 transition-colors duration-300 focus-within:border-accent lg:flex"
            >
              <Search size={14} className="shrink-0 text-neutral-600" strokeWidth={1.5} />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm"
                className="w-full bg-transparent text-xs text-neutral-200 outline-none placeholder:text-neutral-600"
              />
            </form>

            <Link
              to={token ? "/cart" : "/login"}
              className="relative text-neutral-400 transition-colors duration-300 hover:text-white"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {token && count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-accent px-1 text-[10px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {token ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 text-neutral-400 transition-colors duration-300 hover:text-white"
                >
                  <User size={19} strokeWidth={1.5} />
                  <span className="hidden max-w-20 truncate text-[11px] font-semibold uppercase tracking-[0.1em] md:block">
                    {user?.fullname?.split(" ").pop()}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-4 w-44 border border-line bg-ink-1 py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs text-neutral-300 transition-colors duration-200 hover:bg-ink hover:text-white"
                      >
                        <User size={14} strokeWidth={1.5} /> Hồ sơ
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs text-neutral-300 transition-colors duration-200 hover:bg-ink hover:text-white"
                      >
                        <Package size={14} strokeWidth={1.5} /> Đơn hàng
                      </Link>
                      <div className="my-1 h-px bg-line" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-xs text-red-400 transition-colors duration-200 hover:bg-ink"
                      >
                        <LogOut size={14} strokeWidth={1.5} /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden bg-neutral-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-300 hover:bg-accent hover:text-white md:block"
              >
                Đăng nhập
              </Link>
            )}

            <button
              className="text-neutral-400 transition-colors duration-300 hover:text-white md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line py-6 md:hidden">
            <form
              onSubmit={handleSearch}
              className="mb-6 flex items-center gap-2.5 border-b border-line pb-2"
            >
              <Search size={14} className="text-neutral-600" strokeWidth={1.5} />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm"
                className="w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
              />
            </form>

            <div className="flex flex-col gap-5">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-300 transition-colors duration-300 hover:text-accent"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {!token && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-6 block bg-neutral-50 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink"
              >
                Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
