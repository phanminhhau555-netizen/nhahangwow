export const ROLES = {
  ADMIN: 1,
  STAFF: 2,
  KITCHEN: 3,
};

export const ROLE_HOME = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.STAFF]: "/staff/tables",
  [ROLES.KITCHEN]: "/kitchen/orders",
};

export const FEATURE_PERMISSIONS = {
  adminMenu: {
    canCreateMenuItem: true,
    canManageCategories: true,
    canEditRecipes: true,
    canToggleMenuItem: true,
    canDeleteMenuItem: true,
  },
  kitchenMenu: {
    canCreateMenuItem: false,
    canManageCategories: false,
    canEditRecipes: false,
    canToggleMenuItem: false,
    canDeleteMenuItem: false,
  },
  adminWarehouse: {
    canViewInventory: true,
    canViewLogs: true,
    canMoveStock: true,
    canCreateIngredient: true,
    canDeleteIngredient: true,
  },
  kitchenWarehouse: {
    canViewInventory: true,
    canViewLogs: true,
    canMoveStock: true,
    canCreateIngredient: false,
    canDeleteIngredient: false,
  },
};

export const getRoleId = (user) => Number(user?.role_id) || null;

export const getDefaultPath = (user) => ROLE_HOME[getRoleId(user)] || "/admin/dashboard";

export const canAccess = (user, roles) => {
  if (!roles) return true;
  return roles.includes(getRoleId(user));
};
