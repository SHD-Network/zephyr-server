import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header('Authorization');
    const sessionId = authHeader?.split(' ')[1];

    if (sessionId === 'null') {
      req.session = undefined;
      next();
    } else {
      req.session = sessionId;
      next();
    }
  }
}
