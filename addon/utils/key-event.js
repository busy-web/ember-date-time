/**
 * @module Utils
 *
 */
import $ from 'jquery';
import { get } from '@ember/object';
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';

/**
 * Key map referece
 *
 */
const KEY_MAP = {
	'8': 'Backspace', '9': 'Tab', '12': 'Clear', '13': 'Enter', '16': 'Shift', '17': 'Control', '18': 'Alt',
	'19': 'Break', '20': 'CapsLock', '27': 'Escape', '32': 'Space', '33': 'PageUp', '34': 'PageDown',
	'35': 'End', '36': 'Home', '37': 'ArrowLeft', '38': 'ArrowUp', '39': 'ArrowRight', '40': 'ArrowDown',
	'45': 'Insert', '46': 'Delete',
	'48': 0, '49': 1, '50': 2, '51': 3, '52': 4, '53': 5, '54': 6, '55': 7, '56': 8, '57': 9,
	'96': 0, '97': 1, '98': 2, '99': 3, '100': 4, '101': 5, '102': 6, '103': 7, '104': 8, '105': 9,
	'65': 'a', '66': 'b', '67': 'c', '68': 'd', '69': 'e', '70': 'f', '71': 'g', '72': 'h', '73': 'i', '74': 'j',
	'75': 'k', '76': 'l', '77': 'm', '78': 'n', '79': 'o', '80': 'p', '81': 'q', '82': 'r', '83': 's', '84': 't',
	'85': 'u', '86': 'v', '87': 'w', '88': 'x', '89': 'y', '90': 'z',
	'91': 'Meta', '92': 'Meta', '93': 'Meta',
	'106': '*', '107': '+', '109': '-', '110': '.', '111': '/',
	'112': 'f1', '113': 'f2', '114': 'f3', '115': 'f4', '116': 'f5', '117': 'f6', '118': 'f7',
	'119': 'f8', '120': 'f9', '121': 'f10', '122': 'f11', '123': 'f12',
	'144': 'NumLock', '145': 'ScrollLock',
	'186': ';', '187': '=', '188': ',', '189': '-', '190': '.', '191': '/', '192': '`',
	'219': '[', '220': '\\', '221': ']', '222': "'",
	'229': 'Composition',
};

const SHIFT_KEY_MAP = {
	'19': 'Pause',
	'48': ')', '49': '!', '50': '@', '51': '#', '52': '$', '53': '%', '54': '^', '55': '&', '56': '*', '57': '(',
	'96': 0, '97': 1, '98': 2, '99': 3, '100': 4, '101': 5, '102': 6, '103': 7, '104': 8, '105': 9,
	'65': 'A', '66': 'B', '67': 'C', '68': 'D', '69': 'E', '70': 'F', '71': 'G', '72': 'H', '73': 'I', '74': 'J',
	'75': 'K', '76': 'L', '77': 'M', '78': 'N', '79': 'O', '80': 'P', '81': 'Q', '82': 'R', '83': 'S', '84': 'T',
	'85': 'U', '86': 'V', '87': 'W', '88': 'X', '89': 'Y', '90': 'Z',
	'186': ':', '187': '+', '188': '<', '189': '_', '190': '>', '191': '?', '192': '~',
	'219': '{', '220': '|', '221': '}', '222': '"',
};

const TYPE_MAP = {
	modifier: /^(Control|Shift|Alt|Meta)$/,
	action: /^(Enter|Escape|Backspace|Tab)$/,
	arrow: /^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown)$/,
	letter: /^[A-Za-z]$/,
	number: /^[0-9]$/,
	qoute: /^['"`]$/,
	puctuation: /^[.,;:?!]/,
	symbol: /^[@&#$%(){}[\]\\|~_]$/,
	math: /^[+\-*/^><=]$/,
	composition: /^Composition$/
};

function getKeyCode(event) {
	return event.keyCode;
}

/**
	* Takse a event and returns a readable key event for main key events like enter, tab arrow keys
	*
	* @public
	* @method keyCodeTranslator
	* @param event {object}
	* @return {string}
	*/
function translate(event) {
	let key = getKeyCode(event);
	let name = get(KEY_MAP, `${key}`)
	if (event.shiftKey && !isNone(get(SHIFT_KEY_MAP, `${key}`))) {
		name = get(SHIFT_KEY_MAP, `${key}`);
	}

	if (isNone(name)) {
		name = -1;
		window.console.log('Key not defined', key, event);
	}
	return name;
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
		if (disable[i] && disable[i].test(`${key}`)) {
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

function getTypeForKey(key) {
	for (let i in TYPE_MAP) {
		if (TYPE_MAP[i].test(`${key}`)) {
			return i;
		}
	}
	return null;
}

export default function keyEvent(options={}) {
	assert('options.event is required', typeof options.event === 'object' && options.event.target !== undefined);

	let keyCode = getKeyCode(options.event);
	let keyName = translate(options.event);
	let type = getTypeForKey(keyName);

	let disable = [];
	if (options.disable && options.disable.length) {
		options.disable.forEach(item => {
			if (TYPE_MAP[item]) {
				disable.push(TYPE_MAP[item]);
			}
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
	return { keyName, keyCode, type, allowed, preventDefault, throttle };
}

