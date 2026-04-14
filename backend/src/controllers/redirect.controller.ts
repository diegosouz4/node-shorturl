import { Response } from "express";
import { errorResponse } from "../utils/handlerResponse.util";
import { handleErrorDetails } from "../utils/handleErrorDetails.util";
import { redirectService } from "../services/redirect.service";
import { reqUserDetails } from "../middlewares/default.middleware";

class RedirectController {
  async redirect(req: reqUserDetails, res: Response) {
    try {
      const { shortCode } = req.params;
      const { userAgent, userIp, accessDate } = req;

      const payload = Array.isArray(shortCode) ? shortCode[0] : shortCode;
      const redirectUrl = await redirectService.redirect({ shortCode: payload, reqDetails: { userAgent, userIp, accessDate } });

      return res.status(301).redirect(redirectUrl);
    } catch (err: unknown) {
      console.log("[RedirectController | redirect] Error: ", err);

      const { message, statusCode } = handleErrorDetails(err);
      return errorResponse({ res, message: 'erro ao redirecionar URL!', statusCode, details: message });
    }
  }
}

export const redirectController = new RedirectController();