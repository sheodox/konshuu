import Joi from 'joi';
import { AppRequest } from '../routes/auth';
import { NextFunction, Response } from 'express';

export function validateBodySchema(schema: Joi.Schema) {
	return (req: AppRequest, res: Response, next: NextFunction) => {
		const { value, error } = schema.validate(req.body);
		if (error) {
			next({ status: 400, error });

			if (process.env.NODE_ENV === 'development') {
				console.log('Validation error', error);
			}
		} else {
			req.body = value;
			next();
		}
	};
}
