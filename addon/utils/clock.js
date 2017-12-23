/**
 * @module Utils
 *
 */
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';
import { get, set } from '@ember/object';
import Base, { HOUR_FLAG } from './clock/base';
import dataArray, { getHourMinute, getAttrs, createPoints } from './clock/data';
import render from './clock/render';
import SVG from './clock/svg';
import { metaName, elementName } from './clock/string';
import { onMoveStart, onMove, onMoveStop } from './clock/movement';
import {
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
			this.__snap = new SVG(el.get(0));
		}
		return this.__snap;
	}

	renderDOM(timestamp) {
		if (!isNone(this.container)) {
			this.cleanup();

			this.__lastTime = timestamp;
			const height = this.container.height();
			const width = this.container.width();
			this.setBounds(0, 0, height, width);

			this.filterEach('isRender', p => {
				this.svg.minMaxHandler(this.type, p.num, this.__min, this.__max, timestamp);
			});

			// reselet last selected time
			let selected = getHourMinute(this.type, this.__lastTime, this.__selectRounder);
			this.selectPlot(selected);
		}
	}

	cleanup() {
		this.unselectAll();
		if (!isNone(this.__lastGroup)) {
			this.__lastGroup.undrag();
		}

		//if (this.__lastTime) {
		//	// reselet last selected time
		//	let selected = getHourMinute(this.type, this.__lastTime, this.__selectRounder);
		//	this.selectPlot(selected);
		//}
	}

	selectPlot(num) {
		if (!isNone(this.container)) {
			this.svg.selectPlot(num);
		}
	}

	unselectAll() {
		if (!isNone(this.container)) {
			this.filterEach('isRender', p => {
				this.svg.unselectPlot(p.num);
			});
		}
	}

	setBounds(minX, minY, width, height) {
		this.svg.createSnap();

		this.svg.snap.attr({viewBox: `${minX} ${minY} ${width} ${height}`});

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
				const bounds = text.node.getBBox();
				text.attr('transform', `translate(${(armCoords.x2 - (bounds.width / 2))}, ${(armCoords.y2 + (bounds.height / 3))})`);
				if (this.length > 12 && !text.hasClass('cls-text-small')) {
					text.addClass('cls-text-small');
				}
			}

			// calculate section position for click areas on minutes
			if (!isNone(path)) {
				// build the path string
				path.attr(createSVGPath(this.length, degree, faceCoords.cx, faceCoords.cy, pathLen, faceCoords.r));
			}
		});
	}

	handleDrag(num, cb) {
		this.svg.createSnap();

		const { snap, face } = this.svg;
		const faceAttrs = getAttrs(face, ['cx', 'cy']);
		const angle = getSliceDegree(this.points.length, num);

		const { plot, arm, text } = this.svg.at(num);
		const plotAttrs = getAttrs(plot, ['cx', 'cy']);

		if (!isNone(this.__lastGroup)) {
			this.__lastGroup.undrag();
		}

		let group;
		if (!isNone(text)) {
			group = snap.g(arm, plot, text);
		} else {
			group = snap.g(arm, plot);
		}

		let point = this.objectAt(num);
		group.drag(
			onMove(angle, parseFloat(faceAttrs.cx), parseFloat(faceAttrs.cy), parseFloat(plotAttrs.cx), parseFloat(plotAttrs.cy), ang => {
				point = this.getPointFromDegree(ang);
			}),
			onMoveStart(text, 'selected', snap),
			onMoveStop(this, () => {
				cb(point);
			})
		);

		this.__lastGroup = group;
	}

	getPointFromDegree(degree) {
		// get slice num for clock
		let slice = getSliceFromDegree(this.length, degree);

		// check to see if the slice is on the edge
		// of a visible number and move to it so clicks
		// on visible number are easier.
		const upSlice = Math.ceil(slice);
		const downSlice = Math.floor(slice);
		if ((upSlice % this.__rounder) === 0) {
			slice = upSlice;
		} else if ((downSlice % this.__rounder) === 0) {
			slice = downSlice;
		}
		slice = Math.round(slice);
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
