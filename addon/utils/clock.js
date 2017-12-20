/**
 * @module Utils
 *
 */
import { isEmpty } from '@ember/utils';
import { assert } from '@ember/debug';
import { get, set } from '@ember/object';
import _data from './clock/data';
import _render from './clock/render';

export default function clock(target, opts) {
	assert('type is a required option, it can be either h or m', get(opts, 'type') === 'h' || get(opts, 'type') === 'm');

	if(isEmpty(get(opts, 'viewBox'))) {
		let width = 290;
		let height = 290;
		let el = target.$();
		if (el && el.length) {
			width = el.width() || width;
			height = el.height() || height;
		}
		set(opts, 'viewBox', [0, 0, width, height]);
	}

	const data = _data(target, opts);
	return _render(target, data, opts);
}
