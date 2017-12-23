/**
 * @module Core/Utils
 *
 */
import { get } from '@ember/object';

export function createMap() {
	return new window.Map();
}

export function getMapAttr(map, key) {
	let [ k1, k2 ] = key.split('.');
	let attr = map.get(k1);
	if (k2 && attr) {
		attr = get(attr, k2);
	}
	return attr;
}
