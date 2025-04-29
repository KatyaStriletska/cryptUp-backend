import { NextFunction, Request, Response } from 'express';
import {
  AuthException,
  ConflictException,
  DatabaseException,
  ForbiddenException,
  NotFoundException,
  ServerException,
} from '../utils/exceptions/exceptions.utils';
import { HttpStatusCode } from 'axios';

export const exceptionsFilter = (
  error: Error | string,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log(error);

  switch (true) {
    case error instanceof AuthException:
      return response
      .setHeader('Set-Cookie', [
        `${process.env.AUTH_TOKEN_NAME || 'X-Access-Token'}=; domain=${process.env.COOKIES_DOMAIN || 'localhost'}; path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`,
        `connect.sid=; domain=${process.env.COOKIES_DOMAIN || 'localhost'}; path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`
      ])
        .status(HttpStatusCode.Unauthorized)
        .json({ error: error.message });
    case error instanceof ServerException || error instanceof DatabaseException:
      return response.status(HttpStatusCode.InternalServerError).json({ error: error.message });
    case error instanceof ForbiddenException:
      return response.status(HttpStatusCode.Forbidden).json({ error: error.message });
    case error instanceof NotFoundException:
      return response.status(HttpStatusCode.NotFound).json({ error: error.message });
    case error instanceof ConflictException:
      return response.status(HttpStatusCode.Conflict).json({ error: error.message });
    default:
      return response.status(HttpStatusCode.InternalServerError).json({ error });
  }
};
