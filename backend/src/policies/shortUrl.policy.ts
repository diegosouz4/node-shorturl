import type { Roles, ShortUrl } from "../generated/client";
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
  create({ requester }: { requester: userWithCount }) {
    if (requester.role === 'FREEBIE' && requester.totalCreated >= 3) return false;
    return true;
  }

  view({ requester, target }: { requester: baseUser, target: findUrlPlusUser }) {
    const isSelfView = requester.id === target.user.id;
    const isUserAdmOrMaster = handlePermisson.isAdminOrMaster(requester.role);
    const isTargetAdmOrMaster = handlePermisson.isAdminOrMaster(target.user.role);

    if (!isUserAdmOrMaster && !isSelfView) return false;
    if (requester.role === 'ADMIN' && !isSelfView && isTargetAdmOrMaster) return false;
    if (requester.role === 'MASTER' && !isSelfView && target.user.role === 'MASTER') return false;

    return true;
  }

  delete({ requester, target }: { requester: baseUser, target: findUrlPlusUser }) {
    const isUrlActive = target.status === 'ACTIVE';

    if (isUrlActive) return false;
    return this.view({ requester, target })
  }
}

export const shortUrlPolicies = new shortUrlPolicy();