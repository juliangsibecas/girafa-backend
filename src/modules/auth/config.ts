import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  saltRounds: number;
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    saltRounds: parseInt(process.env.SALT_ROUNDS),
  }),
);
