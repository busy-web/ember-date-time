/**
 * @module helpers
 *
 */
import { helper } from '@ember/component/helper';
import paperTime from '@busy-web/ember-date-time/utils/time';

export function formatDate(params) {
	const timestamp = params[0];
	const f = params[1] || 'L';
	return paperTime(timestamp).format(f);
}

export default helper(formatDate);
