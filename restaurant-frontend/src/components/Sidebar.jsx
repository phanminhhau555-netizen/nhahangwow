import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { path: "/admin/dashboard", label: "Tổng quan" },
  { path: "/admin/menu",  label: "Thực đơn" },
  { path: "/admin/tables", label: "Sơ đồ bàn" },
  { path: "/admin/orders", label: "Đơn hàng" },
  { path: "/admin/kitchen", label: "Nhà bếp" },
  { path: "/admin/reports", label: "Báo cáo" },
  { path: "/admin/settings", label: "Cài đặt" },
  { path: "/admin/staff",  label: "Nhân sự" },
  { path: "/admin/menu",label: "Thực đơn" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">DineFlow</p>
            <p className="text-xs text-gray-400">Bộ Quản lý</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-green-50 text-green-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">{user.full_name}</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          Đăng xuất
        </button>
      </div>

      {/* Tạo đơn mới */}
      <div className="p-3">
        <button className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
          + Tạo Đơn Mới
        </button>
      </div>
    </div>
  );
}
