import { Roles } from '../generated/enums';

class Permission {
  hasPermision(currentRole: Roles, allowedRoles: Roles[] = ['ADMIN', 'MASTER']) {
    if (!currentRole) return false;
    return allowedRoles.includes(currentRole);
  }

  isAdminOrMaster(currentRole: Roles) {
    return this.hasPermision(currentRole);
  }
}

export const handlePermisson = new Permission();