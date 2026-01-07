import { User } from "../generated/client";
import { shortUrlModel } from "../model/shortUrl.model";
import { userModel } from "../model/user.model";
import { generateShortURL } from "../utils/generateShortURL.util";
import { userId } from "../types/user.types";
import { shortUrlPolicies } from "../policies/shortUrl.policy";
import { type createShortURLType, createShortURL, type findShortURLType, findShortUrl, type updateShortURLType, updateShortUrl, listShortUrl, type listShortURLType } from "../types/shortUrl.types";

class ShortURLServices {
  async create({ payload, reqUser }: { payload: createShortURLType, reqUser: User }) {
    createShortURL.parse({ ...payload });
    userId.parse({ id: reqUser.id });

    const totalCreated = await shortUrlModel.countByUser({ id: reqUser.id });
    if (!shortUrlPolicies.canCreate({ requester: { ...reqUser, totalCreated } })) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    let shortUrl = '';

    for (let i = 0; i < 3; i++) {
      const short = generateShortURL(7);
      const exist = await shortUrlModel.find({ shortUrl: short });

      if (!exist) {
        shortUrl = short;
        break;
      };
    }

    if (!shortUrl) throw new Error('Falha ao gerar shortURL após múltiplas tentativas');
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
    if (!target) throw new Error("Url não foi encontrada!");

    if (!shortUrlPolicies.canView({ requester: reqUser, target })) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    return target;
  }

  async remove({ payload, reqUser }: { payload: findShortURLType, reqUser: User }) {
    findShortUrl.parse({ ...payload });
    userId.parse({ id: reqUser.id });

    const sanitize: findShortURLType = {};
    if (payload.shortUrl) sanitize.shortUrl = payload.shortUrl.trim();
    if (payload.urlId) sanitize.urlId = payload.urlId.trim();

    const target = await shortUrlModel.find({ ...sanitize });
    if (!target) throw new Error("Url não foi encontrada!");

    if (target.status === 'ACTIVE') throw new Error('URLs ativas não podem ser removidas. Desative antes de excluir.');
    if (!shortUrlPolicies.canDelete({ requester: reqUser, target })) throw new Error('Você não tem autorização para executar esse tipo de ação!');

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
    if (!target || target === null) throw new Error("Url não foi encontrada!");

    if (!shortUrlPolicies.canUpdate({ requester: reqUser, target, update: payload })) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    const updated = await shortUrlModel.update({ ...sanitize, id: target.id });
    return updated;
  }

  async list({ reqUser, filterBy }: { reqUser: User, filterBy: listShortURLType }) {
    userId.parse({ id: reqUser.id });
    listShortUrl.parse(filterBy);

    if (!filterBy.userId) {
      return await shortUrlModel.list({ userId: reqUser.id });
    }

    const target = await userModel.find({ id: filterBy.userId });
    if (!target || target === null) throw new Error("Usuário não encontrado!");

    if (!shortUrlPolicies.canList({ requester: reqUser, target })) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    const list = await shortUrlModel.list({ userId: target.id });
    return list;
  }
}

export const shortURLServices = new ShortURLServices();