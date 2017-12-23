/**
 * @module Core/Utils
 *
 */

export function eachInObject(target, obj, cb) {
	Object.keys(obj).forEach(key => {
		cb.call(target, obj[key], key, obj);
	});
}
