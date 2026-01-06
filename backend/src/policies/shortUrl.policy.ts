import type { Roles } from "../generated/client";

type baseUser = {
  id: string;
  role: Roles;
  totalCreated: number;
}

class shortUrlPolicy {
  create({ requester }: { requester: baseUser }) {
    if (requester.role === 'FREEBIE' && requester.totalCreated >= 3) return false;
    return true;
  }
}

export const shortUrlPolicies = new shortUrlPolicy();