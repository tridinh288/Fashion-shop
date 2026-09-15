import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, LogOut, Package } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import useCartStore from "../../stores/cartStore";
import { logout as logoutApi } from "../../api/authApi";
import Container from "../ui/Container";
import Button from "../ui/Button";

const NAV_LINKS = [
  { label: "Nam", to: "/category?gioi_tinh=1" },
  { label: "Nữ", to: "/category?gioi_tinh=0" },
  { label: "Liên hệ", to: "/contact" },
];

const MENU_ITEM =
  "flex min-h-11 w-full items-center gap-3 px-4 text-sm text-ink-soft transition-colors duration-200 hover:bg-tile hover:text-ink";

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
      <Container>
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-[72px]">
          {/* Cột trái: menu desktop / nút mở menu điện thoại */}
          <div className="flex items-center">
            <nav aria-label="Danh mục chính" className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((l) => {
                const active = currentPath === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    aria-current={active ? "page" : undefined}
                    className={`link-underline text-sm transition-colors duration-200 ${
                      active ? "text-ink" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              className="-ml-2.5 flex h-11 w-11 items-center justify-center text-ink md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>

          <Link to="/" className="font-display text-xl text-ink md:text-2xl">
            Fashion Shop
          </Link>

          {/* Cột phải: tìm kiếm, tài khoản, giỏ */}
          <div className="flex items-center justify-end gap-1 md:gap-3">
            <form
              onSubmit={handleSearch}
              role="search"
              className="hidden items-center gap-2 border-b border-line py-1.5 transition-colors duration-200 focus-within:border-ink lg:flex"
            >
              <Search size={15} strokeWidth={1.5} className="shrink-0 text-ink-faint" aria-hidden="true" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm"
                aria-label="Tìm sản phẩm"
                className="w-36 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
            </form>

            {token ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label="Tài khoản"
                  className="flex h-11 items-center gap-2 px-2 text-ink transition-opacity duration-200 hover:opacity-60"
                >
                  <User size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span className="hidden max-w-24 truncate text-sm md:block">
                    {user?.fullname?.split(" ").pop()}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-52 border border-line bg-surface py-1.5 shadow-lg shadow-black/5">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className={MENU_ITEM}>
                        <User size={15} strokeWidth={1.5} aria-hidden="true" /> Hồ sơ
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className={MENU_ITEM}>
                        <Package size={15} strokeWidth={1.5} aria-hidden="true" /> Đơn hàng
                      </Link>
                      <div className="my-1.5 h-px bg-line" />
                      <button type="button" onClick={handleLogout} className={`${MENU_ITEM} text-sale hover:text-sale`}>
                        <LogOut size={15} strokeWidth={1.5} aria-hidden="true" /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden h-11 items-center px-2 text-sm text-ink-soft transition-colors duration-200 hover:text-ink md:flex"
              >
                Đăng nhập
              </Link>
            )}

            <Link
              to={token ? "/cart" : "/login"}
              aria-label={token && count > 0 ? `Giỏ hàng, ${count} sản phẩm` : "Giỏ hàng"}
              className="relative -mr-2.5 flex h-11 w-11 items-center justify-center text-ink transition-opacity duration-200 hover:opacity-60"
            >
              <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
              {token && count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center bg-ink px-1 text-[10px] font-semibold text-white"
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line py-5 md:hidden">
            <form
              onSubmit={handleSearch}
              role="search"
              className="mb-4 flex items-center gap-2 border-b border-line py-2 focus-within:border-ink"
            >
              <Search size={16} strokeWidth={1.5} className="text-ink-faint" aria-hidden="true" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Tìm sản phẩm"
                aria-label="Tìm sản phẩm"
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
              />
            </form>

            <nav aria-label="Danh mục chính" className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center text-base text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {!token && (
              <Button to="/login" onClick={() => setMenuOpen(false)} className="mt-4 w-full">
                Đăng nhập / Đăng ký
              </Button>
            )}
          </div>
        )}
      </Container>
    </header>
  );
}
