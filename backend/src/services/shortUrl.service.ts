import { User } from "../generated/client";
import { shortUrlModel } from "../model/shortUrl.model";
import { generateShortURL } from "../utils/generateShortURL.util";
import { type createShortURLType, createShortURL } from "../types/shortUrl.types";
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
      const exist = await shortUrlModel.findByShort(short);

      if (!exist) {
        shortUrl = short;
        break;
      };
    }

    if (!shortUrl) throw new Error('Falha ao gerar shortURL após múltiplas tentativas');
    const createShortUrl = await shortUrlModel.create({ userId: reqUser.id, payload: { ...payload, shortUrl } });

    return createShortUrl;
  }
}

export const shortURLServices = new ShortURLServices();