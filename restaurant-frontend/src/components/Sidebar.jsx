import { NavLink, useNavigate } from "react-router-dom";
import {
  CaretDown,
  ChartBar,
  ChefHat,
  GearSix,
  ListChecks,
  SlidersHorizontal,
  SignOut,
  SquaresFour,
  UserCircle,
  UsersThree,
  ForkKnife,
} from "@phosphor-icons/react";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { ROLES } from "../utils/permissions";

const menuItems = [
  { path: "/admin/dashboard", label: "Tổng quan", icon: SquaresFour },
  { path: "/admin/menu", label: "Thực đơn", icon: ForkKnife },
  { path: "/admin/warehouse", label: "Kho hàng", icon: ChefHat },
  { path: "/admin/reports", label: "Báo cáo", icon: ChartBar },
  { path: "/admin/settings", label: "Cài đặt", icon: GearSix },
  { path: "/admin/staff", label: "Nhân sự", icon: UsersThree },
  { path: "/admin/tables", label: "Bàn", icon: UsersThree },

];

const kitchenItems = [
  { path: "/kitchen/orders", label: "Order bếp", icon: ListChecks },
  { path: "/kitchen/menu", label: "Thực đơn", icon: ForkKnife },
  { path: "/kitchen/warehouse", label: "Kho hàng", icon: ChefHat },
];

const staffItems = [
  { path: "/staff/tables", label: "Order món", icon: ForkKnife },
  { path: "/staff/reservations", label: "Quản lí bàn", icon: SlidersHorizontal },
];

const roleMenuItems = {
  [ROLES.ADMIN]: menuItems,
  [ROLES.STAFF]: staffItems,
  [ROLES.KITCHEN]: kitchenItems,
};

const roleLabels = {
  [ROLES.ADMIN]: "Quản trị nhà hàng",
  [ROLES.STAFF]: "Bộ phận phục vụ",
  [ROLES.KITCHEN]: "Bộ phận bếp",
};

const upcomingItems = [
  { label: "Đơn hàng", icon: ListChecks },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, roleId } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const displayName = user.full_name || "Admin";
  const visibleItems = roleMenuItems[roleId] || menuItems;
  const roleLabel = roleLabels[roleId] || "Nhân sự nhà hàng";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-[228px] shrink-0 flex-col border-r border-slate-200/80 bg-[#f9faf4]">
      <div className="relative border-b border-slate-200/80 p-3">
        <button
          type="button"
          onClick={() => setAccountOpen((open) => !open)}
          className="flex w-full items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-2.5 text-left shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          aria-expanded={accountOpen}
          aria-haspopup="menu"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
            {displayName ? (
              <span className="text-sm font-semibold">{displayName.charAt(0).toUpperCase()}</span>
            ) : (
              <UserCircle size={22} weight="duotone" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-black text-slate-900">{displayName}</p>
            <p className="text-xs font-semibold text-slate-400">
              {roleLabel}
            </p>
          </div>
          <CaretDown
            size={16}
            className={`text-slate-400 transition-transform ${accountOpen ? "rotate-180" : ""}`}
          />
        </button>

        {accountOpen && (
          <div
            role="menu"
            className="absolute left-3 right-3 top-[68px] z-20 rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          >
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <SignOut size={18} />
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setAccountOpen(false)}
              className={({ isActive }) =>
                `flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-[13px] transition-colors ${
                  isActive
                    ? "bg-emerald-700 font-black text-white shadow-[0_12px_24px_rgba(4,120,87,0.18)]"
                    : "font-bold text-slate-500 hover:bg-white hover:text-slate-950"
                }`
              }
            >
              <Icon size={18} weight="duotone" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {roleId === ROLES.ADMIN ? (
          <div className="pt-3">
            <p className="px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">
              Sắp có
            </p>
            <div className="mt-2 space-y-1">
              {upcomingItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex min-h-9 items-center gap-2.5 rounded-xl px-3 text-[13px] font-bold text-slate-300"
                    aria-disabled="true"
                  >
                    <Icon size={19} weight="duotone" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </nav>

    </aside>
  );
}
