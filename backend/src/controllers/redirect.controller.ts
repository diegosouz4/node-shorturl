import { Response } from "express";
import { errorResponse } from "../utils/handlerResponse.util";
import { handleErrorDetails } from "../utils/handleErrorDetails.util";
import { redirectService } from "../services/redirect.service";
import { reqUserDetails } from "../middlewares/default.middleware";
import { logger } from "../utils/logger.util";
import { HTTP_STATUS } from "../utils/httpsStatusCode.utils";

class RedirectController {
  async redirect(req: reqUserDetails, res: Response) {
    const log = logger.createLogger('RedirectController', 'redirect');

    try {
      const { shortCode } = req.params;
      const { userAgent, userIp, accessDate } = req;

      const payload = Array.isArray(shortCode) ? shortCode[0] : shortCode;
      const redirectUrl = await redirectService.redirect({ shortCode: payload, reqDetails: { userAgent, userIp, accessDate } });

      return res.status(HTTP_STATUS.FOUND).redirect(redirectUrl);
    } catch (err: unknown) {

      const { message, statusCode } = handleErrorDetails(err);
      log.error({ err, shortURL: req.params.shortCode, details: { userAgent: req.userAgent, userIp: req.userIp, accessDate: req.accessDate } }, message);

      return errorResponse({ res, message: "Error redirecting URL", statusCode, details: message });
    }
  }
}

export const redirectController = new RedirectController();