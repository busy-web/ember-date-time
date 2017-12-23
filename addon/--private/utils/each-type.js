/**
 * @module Core/Utils
 *
 */
import { get } from '@ember/object';

export default function eachType(target, type, cb) {
	Object.keys(target.__proto__).forEach(name => {
		if (target[name] && target[name]._meta) {
			const meta = target[name]._meta;
			if (meta && meta.type === type) {
				cb.call(target, get(target, name), name, meta);
			}
		}
	});
}
