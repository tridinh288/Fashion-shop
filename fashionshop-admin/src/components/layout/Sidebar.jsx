import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Star, MessageSquare, LogOut, Image,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import { adminLogout } from "../../api/authApi";

const NAV = [
  { to: "/",         label: "Dashboard",  icon: LayoutDashboard },
  { to: "/products", label: "Sản Phẩm",   icon: Package         },
  { to: "/orders",   label: "Đơn Hàng",   icon: ShoppingBag     },
  { to: "/users",    label: "Người Dùng",  icon: Users           },
  { to: "/reviews",  label: "Đánh Giá",   icon: Star            },
  { to: "/contacts", label: "Liên Hệ",    icon: MessageSquare   },
  { to: "/covers",   label: "Ảnh Trang Chủ", icon: Image        },
];

export default function Sidebar() {
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await adminLogout(); } catch {}
    logout();
    navigate("/login");
    toast.success("Đã đăng xuất");
  };

  return (
    <aside className="w-56 min-h-screen bg-gray-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <p className="text-white font-bold text-lg">FashionShop</p>
        <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-5 py-4 border-t border-gray-700">
        <p className="text-gray-300 text-xs mb-3 truncate">{admin?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors w-full"
        >
          <LogOut size={15} /> Đăng Xuất
        </button>
      </div>
    </aside>
  );
}
