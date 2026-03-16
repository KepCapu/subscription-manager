import { NextFunction, Request, Response } from 'express';
import { ApiErrorResponse } from '../types/apiError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
) {
  console.error(err);

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
}
