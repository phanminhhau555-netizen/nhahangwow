import { useMemo } from "react";
import { getDefaultPath, getRoleId, ROLES } from "../utils/permissions";

const readUser = () => JSON.parse(localStorage.getItem("user") || "{}");

export default function useAuth() {
  const token = localStorage.getItem("token");
  const user = useMemo(() => readUser(), []);
  const roleId = getRoleId(user);

  return {
    token,
    user,
    roleId,
    isAuthenticated: Boolean(token),
    isAdmin: roleId === ROLES.ADMIN,
    isStaff: roleId === ROLES.STAFF,
    isKitchen: roleId === ROLES.KITCHEN,
    defaultPath: getDefaultPath(user),
  };
}
