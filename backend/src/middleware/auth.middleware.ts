import { NextFunction, Request, Response } from 'express';
import { UserRoleEnum } from '../types/enums/user-role.enum';
import authService from '../modules/auth/auth.service';
import { AuthException, ForbiddenException } from '../utils/exceptions/exceptions.utils';
import { asyncHandler } from '../utils/routes.utils';

export const auth = (roles: UserRoleEnum[] = []) => {
  return asyncHandler(async (request: Request, response: Response, next: NextFunction) => {
    const user = request.session.user;
    console.log('request.session.user', request.session.user)

    const authTokenName = process.env.AUTH_TOKEN_NAME ?? 'X-Access-Token';
    console.log('authTokenName', authTokenName)
    const token = request.cookies?.[authTokenName as any];
    console.log('request.cookies', request.cookies)
    console.log('request.cookies?.[authTokenName as any]', token)


    if (!user) {
      throw new AuthException('The user is unauthorized');
    }


    const session = await authService.getUserSession(user.id);
    const tokenIsValid = token && (await authService.validateAuthToken(token));

    if (!tokenIsValid || new Date(session.expiresAt).getTime() <= Date.now()) {
      await authService.logout(user.id);
      throw new AuthException('The user is unauthorized. Auth token is missing or expired');
    }

    if (roles.length > 0 && !roles.find(role => user.role.includes(role))) {
      throw new ForbiddenException('The user is forbidden to perform this action');
    }

    return next();
  });
};
