import { User } from "../generated/client";
import { shortUrlModel } from "../model/shortUrl.model";
import { generateShortURL } from "../utils/generateShortURL.util";
import { type createShortURLType, createShortURL, type findShortURLType, findShortUrl } from "../types/shortUrl.types";
import { userId } from "../types/user.types";
import { shortUrlPolicies } from "../policies/shortUrl.policy";

class ShortURLServices {
  async create({ payload, reqUser }: { payload: createShortURLType, reqUser: User }) {
    createShortURL.parse({ ...payload });
    userId.parse({ id: reqUser.id });

    const totalCreated = await shortUrlModel.countByUser({ id: reqUser.id });
    if (!shortUrlPolicies.create({ requester: { ...reqUser, totalCreated } })) throw new Error('Você não tem autorização para executar esse tipo de ação!');

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

    if (!shortUrlPolicies.view({ requester: reqUser, target })) throw new Error('Você não tem autorização para executar esse tipo de ação!');

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
    if (!shortUrlPolicies.delete({ requester: reqUser, target })) throw new Error('Você não tem autorização para executar esse tipo de ação!');

    const del = await shortUrlModel.remove({ urlId: target.id });
    return del;
  }
}

export const shortURLServices = new ShortURLServices();