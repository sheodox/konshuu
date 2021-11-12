import { nanoid } from 'nanoid';
import { AppRequest } from '../routes/auth';
import { NextFunction, Response } from 'express';

export const requestId = (req: AppRequest, res: Response, next: NextFunction) => {
	const requestId = nanoid();
	req.requestId = requestId;
	res.set('X-Request-ID', requestId);
	next();
};
