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
    if (!targetUrl) throw new HttpError("URL not found!", HTTP_STATUS.NOT_FOUND);

    const { isValid, statusCode } = redirectPolicy.canRedirect({ targetUrl });

    if (!isValid) {
      switch (statusCode) {
        case HTTP_STATUS.GONE:
          throw new HttpError("Selected URL has expired!", HTTP_STATUS.GONE);
        case HTTP_STATUS.NOT_FOUND:
          throw new HttpError("Selected URL does not exist!", HTTP_STATUS.NOT_FOUND);
        case HTTP_STATUS.FORBIDDEN:
          throw new HttpError("Selected URL is disabled!", HTTP_STATUS.FORBIDDEN);
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