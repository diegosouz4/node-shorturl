import type { Roles, ShortUrl } from "../generated/client";
import type { listShortURLType, updateShortURLType } from "../types/shortUrl.types";
import { handlePermisson } from "../utils/checkPermision.util";

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

class shortUrlPolicy {
  canCreate({ requester }: { requester: userWithCount }) {
    if (requester.role === 'FREEBIE' && requester.totalCreated >= 3) return false;
    return true;
  }

  canView({ requester, target }: { requester: baseUser, target: findUrlPlusUser }) {
    const isSelfView = requester.id === target.user.id;
    const isUserAdmOrMaster = handlePermisson.isAdminOrMaster(requester.role);
    const isTargetAdmOrMaster = handlePermisson.isAdminOrMaster(target.user.role);

    if (!isUserAdmOrMaster && !isSelfView) return false;
    if (requester.role === 'ADMIN' && !isSelfView && isTargetAdmOrMaster) return false;
    if (requester.role === 'MASTER' && !isSelfView && target.user.role === 'MASTER') return false;

    return true;
  }

  canDelete({ requester, target }: { requester: baseUser, target: findUrlPlusUser }) {
    const isUrlActive = target.status === 'ACTIVE';

    if (isUrlActive) return false;
    return this.canView({ requester, target });
  }

  canUpdate({ requester, target, update }: { requester: baseUser, target: findUrlPlusUser, update: updateShortURLType }) {
    const isSameURL = update.originalUrl ? update.originalUrl === target.originalUrl : true;
    const isActive = target.status === 'ACTIVE';

    if (!isSameURL && isActive) throw new Error('Nao pode alterar url quando o status esta como ativo. ')
    if (update.expiresAt) {
      const now = new Date();
      const expired = new Date(update.expiresAt);
      if (now > expired) return false;
    }

    return this.canView({ requester, target });
  }

  canList({ requester, target }: { requester: baseUser, target: baseUser }) {
    const isSelfView = requester.id === target.id;
    const isUserAdmOrMaster = handlePermisson.isAdminOrMaster(requester.role);
    const isTargetAdmOrMaster = handlePermisson.isAdminOrMaster(target.role);

    if (!isUserAdmOrMaster && !isSelfView) return false;
    if (requester.role === 'ADMIN' && !isSelfView && isTargetAdmOrMaster) return false;
    if (requester.role === 'MASTER' && !isSelfView && target.role === 'MASTER') return false;

    return true;
  }
}

export const shortUrlPolicies = new shortUrlPolicy();