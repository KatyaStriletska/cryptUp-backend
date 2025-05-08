import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { Controller } from '../../decorators/app.decorators';
import { AuthException } from '../../utils/exceptions/exceptions.utils';
import authService from './auth.service';

@Controller()
export class AuthController {
  async loginWithWallet(request: Request, response: Response) {
    const { token, publicKey } = request.body;
    request.session.user = await authService.loginWithWallet(token, publicKey, request.sessionID);

    return response
      .setHeader(`Set-Cookie`, `${process.env.AUTH_TOKEN_NAME || 'X-Access-Token'}=${token}; domain=${process.env.COOKIES_DOMAIN || 'localhost'}; path=/; HttpOnly`)
      .status(HttpStatusCode.Created)
      .json(request.session.user);
  }

  async loginWithGoogle(request: Request, response: Response) {
    const { googleAccessToken } = request.body;
    const { user, accessToken } = await authService.loginWithGoogle(
      googleAccessToken,
      request.sessionID,
    );

    request.session.user = user;

    return response
      .setHeader(`Set-Cookie`, `${process.env.AUTH_TOKEN_NAME || 'X-Access-Token'}=${accessToken}; domain=${process.env.COOKIES_DOMAIN || 'localhost'}; path=/; HttpOnly`)
      .status(HttpStatusCode.Created)
      .json(request.session.user);
  }

  async loginWithIdeaforgeToken(request: Request, response: Response) {
    const { ideaforgeAccessToken } = request.body;
    const { user, accessToken } = await authService.loginWithIdeaforgeToken(
      ideaforgeAccessToken,
      request.sessionID,
    );

    request.session.user = user;

    return response
      .status(HttpStatusCode.Created)
      .json({
        accessToken,
      });
  }

  async loginWithCredentials(request: Request, response: Response) {
    const { email, password } = request.body;
    const { user, accessToken } = await authService.loginWithCredentials(
      email,
      password,
      request.sessionID,
    );

    request.session.user = user;

    return response
      .setHeader(`Set-Cookie`, `${process.env.AUTH_TOKEN_NAME || 'X-Access-Token'}=${accessToken}; domain=${process.env.COOKIES_DOMAIN || 'localhost'}; path=/; HttpOnly`)
      .status(HttpStatusCode.Created)
      .json(request.session.user);
  }

  async register(request: Request, response: Response) {
    const user = await authService.register(request.body);

    return response.status(HttpStatusCode.Created).json(user);
  }

  async user(request: Request, response: Response) {
    if (!request.session.user) {
      throw new AuthException(
        'The user is unauthorized',
        'The information about authenticated user is missing in the request session object',
      );
    }

    const user = await authService.getAuthenticatedUser(request.session.user.id);

    return response.status(HttpStatusCode.Ok).json(user);
  }

  async logout(request: Request, response: Response) {
    const user = request.session.user;

    if (!user) {
      throw new AuthException('The user is unauthorized');
    }

    return request.session.destroy(async error => {
      console.log(error);

      try {
        await authService.logout(user.id);
      } catch (err) {
        console.log(err);
      }

      return response
        .setHeader('Set-Cookie', [
          `${process.env.AUTH_TOKEN_NAME || 'X-Access-Token'}=; domain=${process.env.COOKIES_DOMAIN || 'localhost'}; path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`,
          `connect.sid=; domain=${process.env.COOKIES_DOMAIN || 'localhost'}; path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`
        ])
        .status(HttpStatusCode.Created)
        .json({ message: 'The user was successfully logged out' });
    });
  }

  async generateGoogleOAuth2Url(request: Request, response: Response) {
    const url = await authService.generateGoogleOAuth2Url(request.body);

    return response.status(HttpStatusCode.Created).json({ url });
  }

  async generateGoogleOAuth2Token(request: Request, response: Response) {
    const state = JSON.parse((request.query as any).state);
    const code = (request.query as any).code;

    const { token } = await authService.generateGoogleOAuth2Token(code, state);

    return response.setHeader(`Set-Cookie`, `auth.token=${token}; domain=${process.env.COOKIES_DOMAIN || 'localhost'}; path=/;`).redirect(state.referer);
  }
}

export default new AuthController();
