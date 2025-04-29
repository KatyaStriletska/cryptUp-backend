import { User } from '../user.interface';

export interface LoginWithGoogleResponse {
  accessToken: string;
  user: User;
}

export interface LoginWithCredentialsResponse {
  accessToken: string;
  user: User;
}

export interface GenerateJwtTokensResponse {
  accessToken: string;
}

export interface OAuthPayload {
  referer: string;
}

export interface GenerateGoogleOAuth2Response {
  token: string;
}
