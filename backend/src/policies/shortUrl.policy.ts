import type { Roles, ShortUrl } from "../generated/client";
import { policyResult } from "../types/controllerResponse.type";
import type { updateShortURLType } from "../types/shortUrl.types";
import { handlePermisson } from "../utils/checkPermision.util";
import { HTTP_STATUS } from "../utils/httpsStatusCode.utils";

type baseUser = {
  id: string;
  role: Roles;
}

type userWithCount = baseUser & {
  totalCreated: number;
}

type findUrlPlusUser = ShortUrl & {
  user: { id: string; role: Roles; };
}

class ShortUrlPolicy {
  canCreate({ requester }: { requester: userWithCount }): policyResult {
    if (requester.role === 'FREEBIE' && requester.totalCreated >= 3) return { isValid: false, statusCode: HTTP_STATUS.FORBIDDEN };
    return { isValid: true, statusCode: HTTP_STATUS.OK };
  }

  canView({ requester, target }: { requester: baseUser, target: findUrlPlusUser }): policyResult {
    const isSelfView = requester.id === target.user.id;
    const isUserAdmOrMaster = handlePermisson.isAdminOrMaster(requester.role);
    const isTargetAdmOrMaster = handlePermisson.isAdminOrMaster(target.user.role);

    if (!isUserAdmOrMaster && !isSelfView) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'ADMIN' && !isSelfView && isTargetAdmOrMaster) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'MASTER' && !isSelfView && target.user.role === 'MASTER') return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };

    return { isValid: true, statusCode: HTTP_STATUS.OK };
  }

  canDelete({ requester, target }: { requester: baseUser, target: findUrlPlusUser }): policyResult {
    const isUrlActive = target.status === 'ACTIVE';
    if (isUrlActive) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };

    return this.canView({ requester, target });
  }

  canUpdate({ requester, target, update }: { requester: baseUser, target: findUrlPlusUser, update: updateShortURLType }): policyResult {
    const isSameURL = update.originalUrl ? update.originalUrl === target.originalUrl : true;
    const isActive = target.status === 'ACTIVE';

    if (!isSameURL && isActive) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };

    if (update.expiresAt) {
      const now = new Date();
      const expired = new Date(update.expiresAt);
      if (now > expired) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    }

    return this.canView({ requester, target });
  }

  canList({ requester, target }: { requester: baseUser, target: baseUser }): policyResult {
    const isSelfView = requester.id === target.id;
    const isUserAdmOrMaster = handlePermisson.isAdminOrMaster(requester.role);
    const isTargetAdmOrMaster = handlePermisson.isAdminOrMaster(target.role);

    if (!isUserAdmOrMaster && !isSelfView) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'ADMIN' && !isSelfView && isTargetAdmOrMaster) return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };
    if (requester.role === 'MASTER' && !isSelfView && target.role === 'MASTER') return { isValid: false, statusCode: HTTP_STATUS.UNAUTHORIZED };

    return { isValid: true, statusCode: HTTP_STATUS.OK };
  }
}

export const shortUrlPolicy = new ShortUrlPolicy();