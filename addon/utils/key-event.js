/**
 * @module Utils
 *
 */
import $ from 'jquery';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';

/**
 * Key map referece
 *
 */
const KEY_MAP = {
	'9': 'tab', '13': 'enter', '8': 'delete',
	'37': 'left-arrow', '38': 'up-arrow', '39': 'right-arrow', '40': 'down-arrow',
	'191': 'forward-slash', '220': 'back-slash'
};

/**
	* Takse a event and returns a readable key event for main key events like enter, tab arrow keys
	*
	* @public
	* @method keyCodeTranslator
	* @param event {object}
	* @return {string}
	*/
function translate(key) {
	let name = get(KEY_MAP, `${key}`) || -1;
	if (name === -1) {
		if (key >= 48 && key <= 57) {
			name = key - 48;
		} else {
			window.console.log('Key not defined', key, name);
		}
	}
	return name;
}

function getKeyCode(event) {
	return (event.keyCode || event.which);
}

function shouldThrottleKey(event, time=50) {
	let timeout = $.data(event.target, 'timeout');
	if (!timeout) {
		$.data(event.target, 'timeout', true);
		window.setTimeout(() => {
			$.data(event.target, 'timeout', false);
		}, time);
		return false;
	} else {
		return true;
	}
}

function isAllowed(key, allowed=[]) {
	if (isEmpty(allowed)) {
		return true;
	} else if (allowed.indexOf(key) !== -1) {
		return true;
	}
	return false;
}

function _preventDefault(event) {
	return function() {
		event.returnValue = false;
		if(event.preventDefault) {
			event.preventDefault();
		}
		return false;
	}
}

export default function keyEvent(options={}) {
	assert('options.event is required', typeof options.event === 'object' && options.event.target !== undefined);

	let keyCode = getKeyCode(options.event);
	let keyName = translate(keyCode);
	let allowed = isAllowed(keyName, options.allowed);
	let preventDefault = _preventDefault(options.event);

	if (allowed) {
		if (shouldThrottleKey(options.event, options.throttle || 50)) {
			return preventDefault();
		}
	}
	return { keyName, keyCode, allowed, preventDefault };
}

