import { NextFunction, Response } from 'express';
import { AppRequest } from '../routes/auth';

export const requireAuth = (req: AppRequest, res: Response, next: NextFunction) => {
	!req.user ? next({ status: 401 }) : next();
};
