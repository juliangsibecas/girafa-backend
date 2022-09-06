import { registerAs } from '@nestjs/config';

export interface TokenConfig {
  header: string;
  secret: string;
  expiry: string;
}

export interface JwtConfig {
  accessToken: TokenConfig;
  refreshToken: TokenConfig;
}

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    accessToken: {
      header: 'Authorization',
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiry: '60d',
    },
    refreshToken: {
      header: 'Refresh',
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiry: '1y',
    },
  }),
);
