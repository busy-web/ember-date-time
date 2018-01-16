/**
 * @module Utils
 *
 */
import { isNone, isEmpty } from '@ember/utils';
import { assert } from '@ember/debug';
import { Snap, mina } from 'snapsvg';
import { numberToString } from './string';
import { getDate, isInBounds } from './data';
import Base from './base';

export default class SVG extends Base {
	/**
	 * @constructor
	 *
	 */
	constructor(el, opts={}) {
		assert("el is required for class SVG", !isNone(el));
		super();

		this.setProps({ el, opts, snap: null });
	}

	createSnap() {
		this.__snap = new Snap(this.__el);
		return this;
	}

	get snap() {
		if (!this.__snap) {
			this.createSnap();
		}
		return this.__snap;
	}

	get face() {
		return this.snap.select(`.--svg-face`);
	}

	get pivot() {
		return this.snap.select(`.--svg-pivot`);
	}

	has(type, num) {
		assert(`num is required in svg.at, you pased type {${typeof num}} ${num}`, !isEmpty(num));
		if (typeof num === 'number') {
			num = numberToString(num);
		}
		return !isEmpty(this.snap.select(`.--svg-${type}-${num}`));
	}

	at(num) {
		assert(`num is required in svg.at, you pased type {${typeof num}} ${num}`, !isEmpty(num));
		if (typeof num === 'number') {
			num = numberToString(num);
		}

		let text = this.snap.select(`.--svg-text-${num}`);
		const arm = this.snap.select(`.--svg-arm-${num}`);
		const plot = this.snap.select(`.--svg-plot-${num}`);
		const path = this.snap.select(`.--svg-path-${num}`);

		assert(`"arm" was not found with number: ${num}`, !isEmpty(arm));
		assert(`"plot" was not found with number: ${num}`, !isEmpty(plot));
		assert(`"path" was not found with number: ${num}`, !isEmpty(path));

		return { path, arm, plot, text };
	}

	minMaxHandler(type, num, min, max, timestamp) {
		const date = getDate(type, num, timestamp);
		const bounds = isInBounds(date, min, max);
		if (bounds.isBefore || bounds.isAfter) {
			this.disablePlot(num);
		} else {
			this.enablePlot(num);
		}
	}

	clean(start, end) {
		for(let i=start; i<=end; i++) {
			const { text, arm, plot } = this.at(i);
			if (!isNone(text)) {
				text.removeClass('selected');
			}
			arm.insertBefore(this.face);
			plot.insertBefore(this.face);
		}
	}

	unselectPlot(value) {
		const { text, arm, plot } = this.at(value);
		let next, prev;
		if (this.has('plot', value - 1)) {
			prev = this.at(value - 1);
		} else {
			next = this.at(value + 1);
		}

		if (!isNone(text)) {
			text.removeClass('selected');
			if (prev) {
				text.insertAfter(prev.path);
			} else {
				text.insertBefore(next.path);
			}
		}

		if (prev) {
			plot.insertAfter(prev.plot);
			arm.insertAfter(prev.plot);
		} else {
			arm.insertBefore(next.arm);
			plot.insertBefore(next.arm);
		}
	}

	selectPlot(value) {
		const { text, arm, plot } = this.at(value);
		if (!isNone(text) && !text.hasClass('selected')) {
			text.addClass('selected');
		}

		arm.appendTo(this.snap);
		plot.appendTo(this.snap);

		if (!isNone(text) && !text.hasClass('selected')) {
			const fill = (this.__opts.fillColor || 'white');
			text.animate({ fill }, 100, mina.easein).appendTo(this.snap);
		}
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
		const { text, path } = this.at(value);
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
		const { text, path } = this.at(value);
		if (!path.hasClass('disabled')) {
			path.addClass('disabled');
		}

		if (!isNone(text) && !text.hasClass('disabled')) {
			text.addClass('disabled');
		}
	}
}
