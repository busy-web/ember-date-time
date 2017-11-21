/**
 * @module Utils
 *
 */
import $ from 'jquery';
import { get } from '@ember/object';
import { assert } from '@ember/debug';

/**
 * Key map referece
 *
 */
const KEY_MAP = {
	'9': 'tab', '13': 'enter', '8': 'delete', '16': 'shift', '27': 'esc',
	'37': 'left-arrow', '38': 'up-arrow', '39': 'right-arrow', '40': 'down-arrow',
	'191': 'forward-slash', '220': 'back-slash',
	'187': 'equal', '189': 'dash',
	'219': 'left-bracket', '221': 'right-bracket',
	'186': 'semi-colon', '222': 'single-quote',
	'188': 'comma', '190': 'period', '192': 'tilda'
};

const DISABLE_MAP = {
	tab: /^tab$/, enter: /^enter$/, delete: /^delete$/, shift: /^shift$/, esc: /^esc$/,
	semicolon: /^semi-colon$/, singlequote: /^single-quote$/, comma: /^comma$/, period: /^period$/, tilda: /^tilda$/,
	arrows: /^(left|right|up|down)-arrow$/,
	backslash: /^back-slash$/, forwardslash: /^forward-slash&/, slash: /^(back|forward)-slash$/,
	numbers: /^[0-9]$/,
	letters: /^[A-Z]$/,
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
		let _name = String.fromCharCode(key);
		if (/^[0-9A-Z]$/.test(_name)) {
			name = _name;
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

function isAllowed(key, disable=[]) {
	for (let i=0; i<disable.length; i++) {
		if (disable[i].test(`${key}`)) {
			return false;
		}
	}
	return true;
}

function _preventDefault(event) {
	return function() {
		event.returnValue = false;
		event.stopPropagation();
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

	let disable = [];
	if (options.disable && options.disable.length) {
		options.disable.forEach(item => {
			disable.push(DISABLE_MAP[item]);
		});
	}

	let allowed = isAllowed(keyName, disable);
	let preventDefault = _preventDefault(options.event);
	let throttle = false;

	if (allowed) {
		if (shouldThrottleKey(options.event, options.throttle || 50)) {
			throttle = true;
		}
	}
	return { keyName, keyCode, allowed, preventDefault, throttle };
}

