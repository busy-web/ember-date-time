/**
 * @module Utils/Clock
 *
 */
import { get, set } from '@ember/object';

export default class Base {
	constructor() { }

	setProps(opts) {
		Object.keys(opts).forEach(key => {
			set(this, `__${key}`, get(opts, key));
		});
	}
}

const HOUR_FLAG = 'hours';
const MINUTE_FLAG = 'minutes';

export { HOUR_FLAG, MINUTE_FLAG };
