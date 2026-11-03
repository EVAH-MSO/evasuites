export const MANAGE_ROLES = ['admin', 'manager', 'landlord'];

export function canManage(user) {
  if (!user) return false;
  if (user.is_superuser) return true;
  return MANAGE_ROLES.includes(user.role);
}
