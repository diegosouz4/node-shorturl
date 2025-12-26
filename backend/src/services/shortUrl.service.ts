import { shortUrlModel } from "../model/shortUrl.model";
import { type createShortURLType, createShortURL } from "../types/shortUrl.types";
import { generateShortURL } from "../utils/generateShortURL.util";

class ShortURL {
  async create({ url }:createShortURLType) {
    createShortURL.parse({ url });

    const created = await shortUrlModel.create({ url });
    if(!created) throw new Error('Error ao tentar criar a URL')

    let shortUrl = '';
    for(let i = 0; i < 3; i++){
      const short = generateShortURL(7);
      const find = await shortUrlModel.findByShort(short);
      if(find) continue;

      shortUrl = short;
    }

    if(!shortUrl) throw new Error('Nao foi possivel gerar a shorURL');

    const updated = await shortUrlModel.updateShortURL({id: created.id, shortUrl });
    if(!updated) throw new Error('Nao foi possivel gerar a shorURL');

    return updated;
  }

  async list() {
    const list = await shortUrlModel.list();
    if(!list) throw new Error('Nao conseguiu listar as URLs')
    return list;
  }
}

export const shortURLServices = new ShortURL();