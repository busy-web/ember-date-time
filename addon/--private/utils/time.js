/**
 * @module Core/Utils
 *
 */
import moment from 'moment';
import { isNone } from '@ember/utils';

export function utcToLocal(time) {
	return moment.utc(time).subtract(moment.utc(time).local().utcOffset(), 'minutes').valueOf();
}

export function utcFromLocal(time) {
	return moment(time).add(moment(time).utcOffset(), 'minutes').valueOf();
}

export function fromUnix(time) {
	return moment.unix(time).valueOf();
}

export function toUnix(time) {
	return moment(time).unix();
}

export function normalizeTime(time, isUnix, isUTC) {
	if (!isNone(time)) {
		if (isUnix) { time = fromUnix(time); }
		if (isUTC) { time = utcToLocal(time); }
	}
	return time;
}

export function denormalizeTime(time, isUnix, isUTC) {
	if (!isNone(time)) {
		if (isUTC) { time = utcFromLocal(time); }
		if (isUnix) { time = toUnix(time); }
	}
	return time;
}
