/**
 * @module Utils
 *
 */
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';
import { get, set } from '@ember/object';
import { metaName, elementName } from './clock/string-gen';
import { createPoints, SVG } from './clock/data';

/**
 * @class Clock
 */
class Clock {

	/**
	 * @public
	 * @constructor
	 * @params component {class} instance of the component class (this) reference
	 * @params key {string} the key to reference this clocks meta
	 * @params start {number} the number the clock should start with 0, 1...
	 * @params end {number} the number the clock should end with 12, 59...
	 * @params rounder {number} a number to round the clock digits by. 0 to render all numbers. 5 would render 5, 10, 15...
	 */
	constructor(component, key, start=0, end=0, rounder=0) {
		assert("component is required to create a Clock meta object", !isNone(component));

		this.__component = component;
		this.__key = key;
		this.__name = metaName(key);
		this.__elname = elementName(key);
		this.__start = start;
		this.__end = end;
		this.__rounder = rounder;

		let data =createPoints(start, end, rounder);
		this.__points = data.points;
		this.__renderSize = data.renderSize;
	}

	get points() {
		return this.__points;
	}

	get elementName() {
		return this.__elname;
	}

	get length() {
		return this.__renderSize;
	}

	get font() {
		if (this.__renderSize <= 12) {
			return 'regular';
		} else {
			return 'small';
		}
	}

	get container() {
		if (isNone(this.__container) || !this.__container.length) {
			if (!isNone(this.__component.$()) && this.__component.$().length) {
				this.__container = this.__component.$(this.__elname);
			}
		}
		return this.__container;
	}

	snap() {
		const el = this.container.find('.svg-clock > svg');
		this.__snap = new SVG(el.get(0));
		return this.__snap;
	}

	unselectPlot(value) {
		const snap = this.snap();
		if (isNone(snap)) {
			return null;
		}

		const { text, arm, plot } = snap.at(value);
		if (!isNone(text) && text.hasClass('white')) {
			text.removeClass('white');
		}
		arm.insertBefore(this.__snap.face);
		plot.insertBefore(this.__snap.face);
	}

	selectPlot(value) {
		if (isNone(this.__snap)) { return null; }

		const { text, arm, plot } = this.__snap.at(value);
		if (!isNone(text) && !text.hasClass('white')) {
			text.addClass('white');
			text.animate({ fill: "white" }, 100, this.__snap.mina.easein).appendTo(this.__snap.svg);
		}
		arm.appendTo(this.__snap.svg);
		plot.appendTo(this.__snap.svg);
	}

	/**
		* enables an element that was disabled
		*
		* @private
		* @method enableClockNumber
		* @param target {instance} time-picker class reference
		* @param type {string} the type to set either minutes or hours
		* @param value {number} the integer value for the time
		*/
	enablePlot(value) {
		if (isNone(this.__snap)) { return null; }

		const { text, path } = this.__snap.at(value);
		path.removeClass('disabled');
		if (!isNone(text)) {
			text.removeClass('disabled');
		}
	}

	/**
		* disables an element
		*
		* @private
		* @method disableClockNumber
		* @param target {instance} time-picker class reference
		* @param type {string} the type to set either minutes or hours
		* @param value {number} the integer value for the time
		*/
	disablePlot(value) {
		if (isNone(this.__snap)) { return null; }

		const { text, path } = this.__snap.at(value);
		if (!path.hasClass('disabled')) {
			path.addClass('disabled');
		}

		if (!isNone(text) && !text.hasClass('disabled')) {
			text.addClass('disabled');
		}
	}

	each(cb) {
		return this.__points.forEach((point, idx) => {
			cb(point, idx);
		});
	}
}

export function createMetaFor(component, key, start, end, rounder) {
	const clock = new Clock(component, key, start, end, rounder);
	set(component, metaName(key), clock);
}

export function metaFor(component, key) {
	return get(component, metaName(key));
}
