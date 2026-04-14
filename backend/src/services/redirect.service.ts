import { redirectValidate, reqDetailsParams } from "../types/redirect.types";
import { shortUrlModel } from '../model/shortUrl.model';
import { redirectPolicy } from "../policies/redirect.policy";
import { redirectModel } from "../model/redirect.model";
import { HttpError } from "../utils/httpError.util";

class RedirectService {
  async redirect({ shortCode, reqDetails }: { shortCode: string, reqDetails?: reqDetailsParams }) {
    redirectValidate.parse({ shortCode });

    const targetUrl = await shortUrlModel.find({ shortUrl: shortCode });
    if (!targetUrl) throw new HttpError("Url não encontrada!", 404);

    const { canRedirect, code } = redirectPolicy.canRedirect({ targetUrl });

    if (!canRedirect) {
      switch (code) {
        case 410:
          throw new HttpError("Url selecionada está expirada!", 410);
        case 404:
          throw new HttpError("Url selecionada não existe!", 404);
        case 403:
          throw new HttpError("Url selecionada está desativada!", 403);
      }
    }

    const { id } = targetUrl;
    let details: string | undefined = undefined;

    if (reqDetails) {
      const { accessDate, userAgent, userIp } = reqDetails;
      details = JSON.stringify({ accessDate, userAgent, userIp })
    }

    await redirectModel.incrementClicks({ id, details });
    return targetUrl.originalUrl;
  }
}

export const redirectService = new RedirectService();