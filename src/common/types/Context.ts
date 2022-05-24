import { Request, Response } from 'express';

export type CustomContext = {
  req: Request & { user: string };
  res: Response;
};
