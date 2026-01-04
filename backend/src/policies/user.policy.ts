import { Roles } from '../generated/enums';
import { handlePermisson } from '../utils/checkPermision.util';

type baseUser = {
  id: string;
  role: Roles;
}

class Policy {
  canUpdate(requester: baseUser, target: baseUser) {
    if (requester.id === target.id) return true;
    if (requester.role === 'ADMIN' && !handlePermisson.isAdminOrMaster(target.role)) return true;
    if (requester.role === 'MASTER' && target.role !== 'MASTER') return true;

    return false;
  }

  canAssingRole(requester: baseUser, target: baseUser) {
    if (!handlePermisson.isAdminOrMaster(requester.role)) return false;
    if (requester.role === 'ADMIN' && handlePermisson.isAdminOrMaster(target.role)) return false;
    if (requester.role === 'MASTER' && target.role === 'MASTER') return false;

    return true;
  }

  canChangeRole(requester: baseUser, target: baseUser) {
    return this.canAssingRole(requester, target);
  }

  canAdd(requester: baseUser, target: baseUser) {
    return this.canAssingRole(requester, target);
  }

  canDelete(requester: baseUser, target: baseUser) {
    if (requester.id === target.id) return false;
    if (requester.role === 'ADMIN' && handlePermisson.isAdminOrMaster(target.role)) return false;
    if (target.role === 'MASTER') return false;

    return true;
  }

  canView(requester: baseUser, target: baseUser) {
    return this.canUpdate(requester, target);
  }

  canList(requester: baseUser) {
    if (!handlePermisson.isAdminOrMaster(requester.role)) return false;

    return true;
  }
}

export const UserPolicy = new Policy();