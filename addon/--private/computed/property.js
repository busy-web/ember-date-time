/**
 * @module Core/computed
 *
 */
import { getWithDefault, get, set, computed } from '@ember/object';

export default function property(options={}) {
	let defaultValue = options.defaultValue || null;

	let meta = {
		type: 'property',
		defaultValue: defaultValue,
		savedValue: defaultValue,
	};

	return computed({
		get(key) {
			return getWithDefault(this, `__${key}`, defaultValue);
		},
		set(key, value) {
			meta.savedValue = get(this, `__${key}`);
			set(this, `__${key}`, value);
		}
	}).meta(meta);
}
