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
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link to="/" className="shrink-0 text-lg font-bold tracking-tight text-ink">
            FASHION<span className="font-light">SHOP</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => {
              const active = currentPath === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`link-underline text-[13px] font-medium transition-colors duration-300 ${
                    active ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <form
              onSubmit={handleSearch}
              className="hidden w-56 items-center gap-2.5 rounded-full bg-tile px-4 py-2.5 transition-colors duration-300 focus-within:bg-zinc-200/70 lg:flex"
            >
              <Search size={15} className="shrink-0 text-ink-faint" strokeWidth={2} />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm"
                className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
              />
            </form>

            <Link
              to={token ? "/cart" : "/login"}
              className="relative text-ink transition-opacity duration-300 hover:opacity-60"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
              {token && count > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {token ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 text-ink transition-opacity duration-300 hover:opacity-60"
                >
                  <User size={20} strokeWidth={1.6} />
                  <span className="hidden max-w-20 truncate text-[13px] font-medium md:block">
                    {user?.fullname?.split(" ").pop()}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-3 w-48 rounded-xl border border-line bg-paper py-1.5 shadow-lg shadow-black/5">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-soft transition-colors duration-200 hover:bg-tile hover:text-ink"
                      >
                        <User size={15} strokeWidth={1.7} /> Hồ sơ
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink-soft transition-colors duration-200 hover:bg-tile hover:text-ink"
                      >
                        <Package size={15} strokeWidth={1.7} /> Đơn hàng
                      </Link>
                      <div className="my-1.5 h-px bg-line" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 transition-colors duration-200 hover:bg-tile"
                      >
                        <LogOut size={15} strokeWidth={1.7} /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full bg-ink px-5 py-2.5 text-[12.5px] font-semibold text-white transition-opacity duration-300 hover:opacity-85 md:block"
              >
                Đăng nhập
              </Link>
            )}

            <button
              className="text-ink md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line py-5 md:hidden">
            <form
              onSubmit={handleSearch}
              className="mb-5 flex items-center gap-2.5 rounded-full bg-tile px-4 py-2.5"
            >
              <Search size={15} className="text-ink-faint" strokeWidth={2} />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </form>

            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-ink-soft transition-colors duration-300 hover:text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {!token && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-5 block rounded-full bg-ink py-3 text-center text-[12.5px] font-semibold text-white"
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
