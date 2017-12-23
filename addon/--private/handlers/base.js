/**
 * @module Core
 *
 */
import Evented from '@ember/object/evented';
import { assert } from '@ember/debug';
import { isNone, isEmpty } from '@ember/utils';
import EmberObject, { get, set } from '@ember/object';
import eachType from '../utils/each-type';
import property from '../computed/property';
import { createMap } from '../utils/map';

export default EmberObject.extend(Evented, {
	__handler: 'base',

	__setup(params) {
		let attrs = parseAttributes.call(this, params);
		this.setupAttrs(attrs);
	},

	setupAttrs(attrs) {
		this.trigger('setupAttrs', attrs);
		attrs.forEach(item => {
			let { key, value } = item;
			set(this, key, value);
		});
	},


	__update(params) {
		let attrs = parseAttributes.call(this, params);
		notifyUpdates.call(this, attrs, () => {
			this.updateAttrs(attrs);
		});
	},

	updateAttrs(attrs) {
		this.trigger('updateAttrs', attrs);
		attrs.forEach(item => {
			let { key, value } = item;
			set(this, key, value);
		});
	},

	eachProperty(cb) {
		eachType(this, 'property', cb);
	},

	beforeUpdate() {},
	afterUpdate() {},

	handlerFor(name) {
		let manager = get(this, '__manager');
		assert("manager does not exist or is not loaded yet", !isNone(manager));
		return get(manager, `${name}Handler`);
	}
}).reopenClass({ property });

function changedProperty(key, value, oldVal) {
	return { key, value, oldVal };
}

function parseAttributes(properties) {
	let attrs = createMap();
	this.eachProperty((last, key) => {
		let value = get(properties, key);
		if (value !== undefined) {
			attrs.set(key, changedProperty(key, value, last));
		}
	});
	return attrs;
}

function notifyUpdates(changed, cb=function(){}) {
	// call before changes
	this.beforeUpdate();

	// run updates
	cb.call(this);

	// call after changes
	let adjusted = this.afterUpdate(changed);
	if (!isEmpty(adjusted)) {
		changed = adjusted;
	}

	// trigger event update for listeners
	this.trigger('update', get(this, '__handler'), changed);
}
