/**
 * @module Core/computed
 *
 */
import { computed, get, set } from '@ember/object';
import { isNone } from '@ember/utils';

export default function handler(handlerClass) {
	const instance = handlerClass.create();
	return computed(function() {
		if (isNone(get(instance, '__manager'))) {
			set(instance, '__manager', this);
		}
		return instance;
	}).meta({ type: 'handler' });
}
