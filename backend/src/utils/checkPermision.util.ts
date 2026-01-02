import { Roles } from '../generated/enums';

export const checkPermision = (currentRole: Roles, allowedRoles: Roles[] = ['ADMIN', 'MASTER']) => {
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}