import { Roles } from '../generated/enums';
import { policyResult } from '../types/controllerResponse.type';
import { handlePermisson } from '../utils/checkPermision.util';
import { HTTP_STATUS } from '../utils/httpsStatusCode.utils';

type baseUser = {
  id: string;
  role: Roles;
}

class Policy {
  canUpdate(requester: baseUser, target: baseUser): policyResult {
    if (requester.id === target.id) return { isValid: true, statusCode: HTTP_STATUS.ACCEPTED };
    if (requester.role === 'ADMIN' && !handlePermisson.isAdminOrMaster(target.role)) return { isValid: true, statusCode: HTTP_STATUS.ACCEPTED };
    if (requester.role === 'MASTER' && target.role !== 'MASTER') return { isValid: true, statusCode: HTTP_STATUS.ACCEPTED };

    return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
  }

  canAssingRole(requester: baseUser, target: baseUser): policyResult {
    if (!handlePermisson.isAdminOrMaster(requester.role)) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'ADMIN' && handlePermisson.isAdminOrMaster(target.role)) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'MASTER' && target.role === 'MASTER') return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };

    return { isValid: true, statusCode: HTTP_STATUS.ACCEPTED };
  }

  canAssignStatus(requester: baseUser, target: baseUser): policyResult {
    if (requester.id === target.id) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    return this.canAssingRole(requester, target);
  }

  canChangeRole(requester: baseUser, target: baseUser): policyResult {
    return this.canAssingRole(requester, target);
  }

  canAdd(requester: baseUser, targetRole: Roles): policyResult {
    if (!handlePermisson.isAdminOrMaster(requester.role)) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'ADMIN' && handlePermisson.isAdminOrMaster(targetRole)) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'MASTER' && targetRole === 'MASTER') return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };

    return { isValid: true, statusCode: HTTP_STATUS.ACCEPTED };
  }

  canDelete(requester: baseUser, target: baseUser): policyResult {
    if (requester.id === target.id) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'ADMIN' && handlePermisson.isAdminOrMaster(target.role)) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (target.role === 'MASTER') return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };

    return { isValid: true, statusCode: HTTP_STATUS.ACCEPTED };
  }

  canView(requester: baseUser, target: baseUser): policyResult {
    return this.canUpdate(requester, target);
  }

  canList(requester: baseUser): policyResult {
    if (!handlePermisson.isAdminOrMaster(requester.role)) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };

    return { isValid: true, statusCode: HTTP_STATUS.ACCEPTED };
  }
}

export const UserPolicy = new Policy();