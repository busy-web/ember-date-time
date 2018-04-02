/**
 * @module Utils
 *
 */
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';
import { get, set } from '@ember/object';
import Base from './clock/base';
import { HOUR_FLAG } from './constant';
import dataArray, { /*getHourMinute,*/ getAttrs, createPoints } from './clock/data';
import render from './clock/render';
import SVG from './clock/svg';
import { metaName, elementName } from './clock/string';
import { onMoveStart, onMove, onMoveStop } from './clock/movement';
import {
	angleOfLine,
	getSliceDegree,
	getLineFromDegree,
	getSliceFromDegree,
	getBoundsCenter,
	createSVGPath
} from './clock/math';

/**
 * @class Clock
 */
class Clock extends dataArray(render(Base)) {
	/**
	 * @public
	 * @constructor
	 * @params component {class} instance of the component class (this) reference
	 * @params key {string} the key to reference this clocks meta
	 * @params start {number} the number the clock should start with 0, 1...
	 * @params end {number} the number the clock should end with 12, 59...
	 * @params rounder {number} a number to round the clock digits by. 0 to render all numbers. 5 would render 5, 10, 15...
	 */
	constructor(component, key, start=0, end=0, min, max, rounder=0, selectRounder=0) {
		assert("component is required to create a Clock meta object", !isNone(component));
		let { points, renderSize } = createPoints(start, end, rounder, selectRounder);
		super(points);

		this.setProps({
			component, key,
			name: metaName(key),
			elname: elementName(key),
			start, end, min, max,
			rounder, selectRounder,
			renderSize,
			lastTime: null,
			lastGroup: null
		});
	}

	get type() { return this.__key; }
	get points() { return this.__data; }
	get elementName() { return this.__elname; }
	get length() { return this.__renderSize; }

	get container() {
		if (isNone(this.__container) || !this.__container.length) {
			if (!isNone(this.__component.$()) && this.__component.$().length) {
				this.__container = this.__component.$(this.__elname);
			}
		}
		return this.__container;
	}

	get svg() {
		if (!this.__snap) {
			const el = this.container.find('svg');
			this.__snap = new SVG(el.get(0), { rounder: this.__rounder, selectRounder: this.__selectRounder, min: this.__min, max: this.__max });
		}
		return this.__snap;
	}

	renderDOM(timestamp) {
		if (!isNone(this.container)) {
			this.__lastTime = timestamp;
			const height = this.container.height();
			const width = this.container.width();
			this.setBounds(0, 0, height, width);

			this.filterEach('isRender', p => {
				this.svg.minMaxHandler(this.type, p.num, this.__min, this.__max, timestamp);
			});
		}
	}

	click(cb) {
		this.__clickHandler = (evt) => this.clickHandler(evt, cb);
		this.svg.snap.click(this.__clickHandler);
	}

	unclick() {
		this.svg.snap.unclick(this.__clickHandler);
	}

	clickHandler(evt, cb=function(){}) {
		const faceAttrs = getAttrs(this.svg.face, ['cx', 'cy']);

		// use offsetX and offsetY to get local point to clock
		let angle = angleOfLine(evt.offsetX, evt.offsetY, faceAttrs.cx, faceAttrs.cy);
		let point = this.getPointFromDegree(angle);
		cb(point.num);
	}

	cleanup() {
		if (!isNone(this.container)) {
			this.svg.clean(this.__start, this.__end);
		}
	}

	selectPlot(num) {
		if (!isNone(this.container)) {
			this.svg.selectPlot(num);
		}
	}

	unselectPlot(num) {
		if (!isNone(this.container)) {
			this.svg.unselectPlot(num);
		}
	}

	setBounds(minX, minY, width, height) {
		// hide box until calculations have been made
		// safari fix
		this.svg.__el.style.display = "none";
		this.svg.snap.attr({ viewBox: `${minX} ${minY} ${width} ${height}` });

		const faceCoords = getBoundsCenter(width, height);

		this.svg.face.attr({ cx: faceCoords.cx, cy: faceCoords.cy, r: faceCoords.r });
		this.svg.pivot.attr({ cx: faceCoords.cx, cy: faceCoords.cy, r: ( faceCoords.r * 0.0283 ) });

		const plotR = this.type === HOUR_FLAG ? (faceCoords.r * 0.14) : (faceCoords.r * 0.12);		// radius for the plot circles that hold the numbers
		const padding = (width * 0.0306);																												// padding to keep plot circles in the clock face
		const armLen = (faceCoords.r - plotR) - padding;																				// length for the arms on the clock
		const pathLen = (armLen - (plotR * 2));

		this.filterEach('isRender', point => {
			const { arm, plot, path, text } = this.svg.at(point.num);
			const degree = getSliceDegree(this.points.length, point.num);

			const armCoords = getLineFromDegree(degree, armLen, faceCoords.cx, faceCoords.cy);		// xy coords for the plot circle center
			arm.attr(armCoords);
			plot.attr({ cx: armCoords.x2, cy: armCoords.y2, r: plotR });

			// calculate text position if there is a text
			// at this number
			if (!isNone(text)) {
				// show box long enough to get text box size
				this.svg.__el.style.display = "";
				const bounds = text.node.getBBox();
				this.svg.__el.style.display = "none";

				let tx = (armCoords.x2 - (bounds.width / 2));
				let ty = (armCoords.y2 + (bounds.height / 3));
				let tAttr = `translate(${tx}, ${ty})`;
				text.attr('transform', tAttr);
			}

			// calculate section position for click areas on minutes
			if (!isNone(path)) {
				const pt = createSVGPath(this.length, degree, faceCoords.cx, faceCoords.cy, pathLen, faceCoords.r);
				// build the path string
				path.attr(pt);
			}
		});
		// show box
		this.svg.__el.style.display = "";
	}

	handleDrag(num, cb) {
		const faceAttrs = getAttrs(this.svg.face, ['cx', 'cy']);
		const angle = getSliceDegree(this.points.length, num);

		const { plot, arm, text } = this.svg.at(num);
		const plotAttrs = getAttrs(plot, ['cx', 'cy']);

		if (!isNone(this.__lastGroup)) {
			this.__lastGroup.undrag();
		}

		let group;
		if (!isNone(text)) {
			group = this.svg.snap.g(arm, plot, text);
		} else {
			group = this.svg.snap.g(arm, plot);
		}

		let point;
		group.drag(
			onMove(angle, parseFloat(faceAttrs.cx), parseFloat(faceAttrs.cy), parseFloat(plotAttrs.cx), parseFloat(plotAttrs.cy), ang => {
				point = this.getPointFromDegree(ang);
			}),
			onMoveStart(text, 'selected', this.svg.snap),
			onMoveStop(this, (el, evt) => {
				if (!point) {
					// use offsetX and offsetY to get local point to clock
					let angle = angleOfLine(evt.offsetX, evt.offsetY, faceAttrs.cx, faceAttrs.cy);
					point = this.getPointFromDegree(angle);
				}
				cb(point.num);
			})
		);

		this.__lastGroup = group;
	}

	getPointFromDegree(degree) {
		let len = this.__end;
		if (this.__start === 0) {
			len = len + 1;
		}

		// get round num for rounding by 1, 5, 10, 15, 30
		const round = this.__selectRounder || 1;

		// get slice num for clock
		let slice = getSliceFromDegree(len, degree);

		// round the slice based on the selected round number
		slice = Math.round(slice / round) * round;

		// make sure max and min numbers are correct
		if (this.__end < slice) {
			slice = this.__start;
		} else if (this.__start > slice) {
			slice = this.__end;
		}

		// subtract the offset for the array index
		if (this.__start !== 0) {
			slice = slice - this.__start;
		}

		return this.objectAt(slice);
	}
}

export function createMetaFor(component, key, start, end, min, max, rounder, selectRounder) {
	const clock = new Clock(component, key, start, end, min, max, rounder, selectRounder);
	set(component, metaName(key), clock);
}

export function metaFor(component, key) {
	return get(component, metaName(key));
}
