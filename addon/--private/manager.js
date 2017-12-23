/**
 * @module Core
 *
 */
import EmberObject, { get } from '@ember/object';
import eachType from './utils/each-type';
import handler from './computed/handler';
import DateHandler from './handlers/date';
import UIHandler from './handlers/user-interface';
import ClockHandler from './handlers/clock';
import FormatHandler from './handlers/format';

const NOT_FOUND = '--NOT_FOUND--';

function getFromHandler(target, key) {
	let proto = target.__proto__;
	if (proto[key]) {
		return get(target, key);
	} else {
		return NOT_FOUND;
	}
}

export default EmberObject.extend({
	uiHandler: handler(UIHandler),
	dateHandler: handler(DateHandler),
	clockHandler: handler(ClockHandler),
	formatHandler: handler(FormatHandler),

	get(key) {
		let val = getFromHandler(this, key);
		if (val === NOT_FOUND) {
			this.eachHandler(handler => {
				if (val === NOT_FOUND) {
					val = getFromHandler(handler, key);
				}
			});

			if (val === NOT_FOUND) {
				return null;
			}
		}
		return val;
	},

	setup(args) {
		this.eachHandler(handler => {
			return handler && handler.__setup(args);
		});
	},

	update(args) {
		this.eachHandler(handler => {
			return handler && handler.__update(args);
		});
	},

	eachHandler(cb) {
		eachType(this, 'handler', cb);
	}
});
