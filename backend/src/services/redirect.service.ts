import { redirectValidate, reqDetailsParams } from "../types/redirect.types";
import { shortUrlModel } from '../model/shortUrl.model';
import { redirectPolicy } from "../policies/redirect.policy";
import { redirectModel } from "../model/redirect.model";
import { HttpError } from "../utils/httpError.util";
import { HTTP_STATUS } from "../utils/httpsStatusCode.utils";

class RedirectService {
  async redirect({ shortCode, reqDetails }: { shortCode: string, reqDetails?: reqDetailsParams }) {
    redirectValidate.parse({ shortCode });

    const targetUrl = await shortUrlModel.find({ shortUrl: shortCode });
    if (!targetUrl) throw new HttpError("Url não encontrada!", HTTP_STATUS.NOT_FOUND);

    const { canRedirect, code } = redirectPolicy.canRedirect({ targetUrl });

    if (!canRedirect) {
      switch (code) {
        case HTTP_STATUS.GONE:
          throw new HttpError("Url selecionada está expirada!", HTTP_STATUS.GONE);
        case HTTP_STATUS.NOT_FOUND:
          throw new HttpError("Url selecionada não existe!", HTTP_STATUS.NOT_FOUND);
        case HTTP_STATUS.FORBIDDEN:
          throw new HttpError("Url selecionada está desativada!", HTTP_STATUS.FORBIDDEN);
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