import { registerAs } from '@nestjs/config';

export interface DbConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export const dbConfig = registerAs(
  'db',
  (): DbConfig => ({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),
);
