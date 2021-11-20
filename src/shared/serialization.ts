import * as onaji from 'onaji';
import { CalendarDate } from './dates.js';

export const serialize = (data: any) => {
	return onaji.serialize(data, (data) => {
		if (data instanceof CalendarDate) {
			return ['CalendarDate', data.serialize()];
		}
	});
};

export function deserialize<T>(data: string) {
	return onaji.deserialize<T>(data, (type, serialized) => {
		switch (type) {
			case 'CalendarDate':
				return CalendarDate.deserialize(serialized);
		}
	});
}
