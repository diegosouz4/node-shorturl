import { User } from "../generated/client";
import { shortUrlModel } from "../model/shortUrl.model";
import { userModel } from "../model/user.model";
import { generateShortURL } from "../utils/generateShortURL.util";
import { userId } from "../types/user.types";
import { shortUrlPolicies } from "../policies/shortUrl.policy";
import { type createShortURLType, createShortURL, type findShortURLType, findShortUrl, type updateShortURLType, updateShortUrl, listShortUrl, type listShortURLType } from "../types/shortUrl.types";

import { ShortUrlWhereInput } from '../generated/models';
import { config } from '../config/system.config';
import { cursorObj, cursorObjTypes, cursorPaginationsParams, cursorParams, decodeCursor, encodeCursor } from "../types/cursorPagination.types";
import { HttpError } from "../utils/httpError.util";
import { HTTP_STATUS } from "../utils/httpsStatusCode.utils";

const defaultPaginationsParams = config.pagination;

class ShortURLServices {
  async create({ payload, reqUser }: { payload: createShortURLType, reqUser: User }) {
    createShortURL.parse({ ...payload });
    userId.parse({ id: reqUser.id });

    const totalCreated = await shortUrlModel.countByUser({ id: reqUser.id });
    const { isValid, statusCode } = shortUrlPolicies.canCreate({ requester: { ...reqUser, totalCreated } });
    if (!isValid) throw new HttpError('You do not have authorization to perform this action!', statusCode);

    let shortUrl = '';

    for (let i = 0; i < 3; i++) {
      const short = generateShortURL(7);
      const exist = await shortUrlModel.find({ shortUrl: short });

      if (!exist) {
        shortUrl = short;
        break;
      };
    }

    if (!shortUrl) throw new HttpError('Failed to generate shortURL after multiple attempts', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const createShortUrl = await shortUrlModel.create({ userId: reqUser.id, payload: { ...payload, shortUrl } });

    return createShortUrl;
  }

  async find({ reqUser, payload }: { payload: findShortURLType, reqUser: User }) {
    findShortUrl.parse({ ...payload });
    userId.parse({ id: reqUser.id });

    const sanitize: findShortURLType = {};
    if (payload.shortUrl) sanitize.shortUrl = payload.shortUrl.trim();
    if (payload.urlId) sanitize.urlId = payload.urlId.trim();

    const target = await shortUrlModel.find({ ...sanitize });
    if (!target) throw new HttpError('Short URL not found!', HTTP_STATUS.NOT_FOUND);

    const { isValid, statusCode } = shortUrlPolicies.canView({ requester: reqUser, target });
    if (!isValid) throw new HttpError('You do not have authorization to perform this action!', statusCode);

    return target;
  }

  async remove({ payload, reqUser }: { payload: findShortURLType, reqUser: User }) {
    findShortUrl.parse({ ...payload });
    userId.parse({ id: reqUser.id });

    const sanitize: findShortURLType = {};
    if (payload.shortUrl) sanitize.shortUrl = payload.shortUrl.trim();
    if (payload.urlId) sanitize.urlId = payload.urlId.trim();

    const target = await shortUrlModel.find({ ...sanitize });
    if (!target) throw new HttpError('Short URL not found!', HTTP_STATUS.NOT_FOUND);

    if (target.status === 'ACTIVE') throw new HttpError('Active URLs cannot be removed. Deactivate before deleting.', HTTP_STATUS.UNAUTHORIZED);

    const { isValid, statusCode } = shortUrlPolicies.canDelete({ requester: reqUser, target });
    if (!isValid) throw new HttpError('You do not have authorization to perform this action!', statusCode);

    const del = await shortUrlModel.remove({ urlId: target.id });
    return del;
  }

  async update({ payload, reqUser }: { payload: updateShortURLType, reqUser: User }) {
    updateShortUrl.parse({ ...payload });
    userId.parse({ id: reqUser.id });

    const sanitize: updateShortURLType = {};
    if (payload.shortUrl) sanitize.shortUrl = payload.shortUrl.trim();
    if (payload.originalUrl) sanitize.originalUrl = payload.originalUrl.trim();
    if (payload.expiresAt) sanitize.expiresAt = payload.expiresAt.trim();
    if (payload.status) sanitize.status = payload.status;

    const target = await shortUrlModel.find({ shortUrl: payload.shortUrl });
    if (!target || target === null) throw new HttpError('Short URL not found!', HTTP_STATUS.NOT_FOUND);

    const { isValid, statusCode } = shortUrlPolicies.canUpdate({ requester: reqUser, target, update: payload });
    if (!isValid) throw new HttpError('You do not have authorization to perform this action!', statusCode);

    const updated = await shortUrlModel.update({ ...sanitize, id: target.id });
    return updated;
  }

  async list({ reqUser, filterBy, reqPagination }: { reqUser: User, filterBy?: listShortURLType, reqPagination: cursorPaginationsParams }) {
    userId.parse({ id: reqUser.id });
    listShortUrl.parse(filterBy);

    const pagination = cursorParams.parse(reqPagination);
    const limit = pagination.limit ?? defaultPaginationsParams.limit

    const isSelfSearch = !filterBy?.userId || filterBy?.userId === reqUser.id;
    const target = isSelfSearch ? reqUser : await userModel.find({ id: filterBy.userId });

    let nextCursorObj: cursorObjTypes | undefined = undefined;
    if (pagination.cursor) nextCursorObj = cursorObj.parse(decodeCursor(pagination.cursor));

    if (!target || target === null) throw new HttpError("User not found!", HTTP_STATUS.NOT_FOUND);

    const { isValid, statusCode } = shortUrlPolicies.canList({ requester: reqUser, target });
    if (!isValid) throw new HttpError('You do not have authorization to perform this action!', statusCode);

    const where: ShortUrlWhereInput = {
      userId: isSelfSearch ? reqUser.id : filterBy?.userId,
    };

    const list = await shortUrlModel.list({ limit, where, cursor: nextCursorObj });
    const nextCursor = list.length <= limit ? null : list[limit - 1];

    return {
      data: list.slice(0, limit),
      hasNext: !!nextCursor,
      nextCursor: !nextCursor ? null : encodeCursor({ id: nextCursor.id, createdAt: nextCursor.createdAt }),
    };
  }
}

export const shortURLServices = new ShortURLServices();