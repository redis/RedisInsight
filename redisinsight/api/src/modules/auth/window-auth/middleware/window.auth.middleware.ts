import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { API_HEADER_WINDOW_ID } from 'src/common/constants';
import { WindowAuthService } from '../window-auth.service';
import { WindowUnauthorizedException } from '../constants/exceptions';
import config from 'src/utils/config';

@Injectable()
export class WindowAuthMiddleware implements NestMiddleware {
  private logger = new Logger('WindowAuthMiddleware');
  constructor(private windowAuthService: WindowAuthService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { windowId } = WindowAuthMiddleware.getWindowIdFromReq(req);

    const isAuthorized = await this.windowAuthService.isAuthorized(windowId);

    if (!isAuthorized) {
      this.throwError(req, ERROR_MESSAGES.UNDEFINED_WINDOW_ID);
    }

    next();
  }

  private static getWindowIdFromReq(req: Request) {
    return { windowId: `${req?.headers?.[API_HEADER_WINDOW_ID]}` };
  }

  private throwError(req: Request, message: string) {
    const { method, url } = req;
    this.logger.error(`${message} ${method} ${url}`);

    throw new WindowUnauthorizedException(message);
  }
}
