/**
 * @module Utils/Clock
 *
 */
import { isEmpty } from '@ember/utils';
import { assert } from '@ember/debug';
import { Snap, mina } from 'snapsvg';
import { formatNumber } from './string-gen';

export function createPoints(start, end, rounder) {
	const points = [];
	let renderSize = 0;
	for (let num=start; num<=end; num++) {
		let isVisible = false;
		if ((num % rounder) === 0) {
			isVisible = true;
			renderSize += 1;
		}
		let value = formatNumber(num);
		points.push({ num, value, isVisible });
	}
	return { points, renderSize };
}

export function SVG(el) {
	this.mina = mina;

	const __svg = new Snap(el);
	const face = __svg.select(`.--svg-face`);
	const pivot = __svg.select(`.--svg-pivot`);

	this.svg = __svg;
	this.face = face;
	this.pivot = pivot;
	this.at = elementsAt(__svg);
}

function elementsAt(svg) {
	return function at(num) {
		assert(`num is required in svg.at, you pased type {${typeof num}} ${num}`, !isEmpty(num));
		if (typeof num === 'number') {
			num = formatNumber(num);
		}

		let text = svg.select(`.--svg-text-${num}`);
		const arm = svg.select(`.--svg-arm-${num}`);
		const plot = svg.select(`.--svg-plot-${num}`);
		const path = svg.select(`.--svg-path-${num}`);

		assert(`"arm" was not found with number: ${num}`, !isEmpty(arm));
		assert(`"plot" was not found with number: ${num}`, !isEmpty(plot));
		assert(`"path" was not found with number: ${num}`, !isEmpty(path));

		return { path, arm, plot, text };
	}
}



//import EmberObject, { computed, get, getWithDefault } from '@ember/object';
//import { Snap } from 'snapsvg';
//import _time from '../time';
//const CircleObject = EmberObject.extend({ cx: null, cy: null, r: null });
//const LineObject = EmberObject.extend({ x1: null, x2: null, y1: null, y2: null });
//
//const AreaObject = EmberObject.extend({
//	mx: null, my: null,
//	qx1: null, qx2: null, qy1: null, qy2: null,
//	lx1: null, lx2: null, ly1: null, ly2: null,
//
//	d: computed('mx', 'my', 'qx1', 'qx2', 'qy1', 'qy2', 'lx1', 'lx2', 'ly1', 'ly2', function() {
//		let { mx, my, qx1, qy1, qx2, qy2, lx1, ly1, lx2, ly2 } = this.getProperties('mx', 'my', 'qx1', 'qy1', 'qx2', 'qy2', 'lx1', 'ly1', 'lx2', 'ly2');
//		return `M${mx} ${my} Q ${qx1} ${qy1} ${qx2} ${qy2} L ${lx1} ${ly1} ${lx2} ${ly2} Z`;
//	})
//});
//
//const PointObject = EmberObject.extend({
//	title: '',
//
//	num: null,
//	viewBox: null,
//	isVisible: false,
//
//	value: computed('num', function() {
//		let num = get(this, 'num') || 0;
//		return num < 10 ? `0${num}` : `${num}`;
//	}),
//
//	area: null,
//	circle: null,
//	line: null,
//
//	x: null,
//	y: null,
//
//	transform: computed('x', 'y', function() {
//		let t = `translate(${get(this, 'x')}, ${get(this, 'y')})`;
//		console.log('t', t);
//		return t;
//	})
//});
//
//const DataObject = EmberObject.extend({ clock: null, center: null, maxPoints: null, minPoints: null });
//
//export default function data(target, opts) {
//	const [ minX, minY, width, height ] = get(opts, 'viewBox');
//	const cx = (width - minX) / 2;
//	const cy = (height - minY) / 2;
//	const r  = (width < height ? cx : cy);
//	const cr = r*0.0283;
//	const nr = r * 0.12; //0.14
//	const space = r - cr - nr;
//	const selected = getSelected(get(opts, 'timestamp'), get(opts, 'type'));
//
//	const points = mapPoints(get(opts, 'type'), get(opts, 'clickableNum'), num => {
//		const degree = getDegree(get(opts, 'clickableNum'), num);
//		const { x1, y1 } = getPointFromAngle(degree, space, cx, cy);
//		return {
//			num,
//			type: get(opts, 'type'),
//			x: x1, y: y1,
//			selected: (num === selected),
//			isVisible: isVisibleNumber(num, get(opts, 'visibleNum'), get(opts, 'clickableNum')),
//			circle: CircleObject.create({ cx: x1, cy: y1, r: nr }),
//			line: LineObject.create({ x1, y1, x2: cx, y2: cy }),
//			area: buildClickArea(get(opts, 'visibleNum'), degree, cx, cy, r)
//		};
//	});
//
//	const clock = CircleObject.create({ cx, cy, r });
//	const center = CircleObject.create({ cx, cy, r: cr });
//
//	return DataObject.create({ clock, center, points, viewBox: get(opts, 'viewBox') });
//}
//
//function mapPoints(type, len, cb) {
//	let data = [];
//	let start = type === 'h' ? 1 : 0;
//	let end = type === 'h' ? 12 : 59;
//	for(let i=0; i<=len; i++) {
//		if (i >= start && i <= end) {
//			data.push(PointObject.create(cb(i)));
//		}
//	}
//	return data;
//}
//
//function getSelected(time, type) {
//	if (!time) {
//		return 0;
//	}
//
//	if (type === 'h') {
//		return _time(time).hours();
//	} else if (type === 'm') {
//		return _time(time).minutes();
//	}
//}
//
//function isVisibleNumber(num, min, max) {
//	return (num%(max/min)) === 0;
//}
//
//function buildClickArea(points, degree, cx, cy, r) {
//	const space = ((360/points)/2);
//	const lDegree = ((degree - space) + 360) % 360; // get the angle for the left bounds
//	const rDegree = (degree + space) % 360; // get the angle for the right bounds
//
//	// get the bottom left and right points
//	const lp = getPointFromAngle(lDegree, r/2, cx, cy);
//	const rp = getPointFromAngle(rDegree, r/2, cx, cy);
//
//	// get the top left and right points
//	const lph = getPointFromAngle(lDegree, r, cx, cy);
//	const rph = getPointFromAngle(rDegree, r, cx, cy);
//
//	// get the point to curve the top bar to.
//	const bp = getPointFromAngle(degree, r, cx, cy);
//
//	// mapping for points:
//	// `M${lph.x} ${lph.y} Q ${bp.x} ${bp.y} ${rph.x} ${rph.y} L ${rp.x} ${rp.y} ${lp.x} ${lp.y} Z`
//	let area = AreaObject.create({
//		mx: lph.x1, my: lph.y1,
//		qx1: bp.x1, qy1: bp.y1, qx2: rph.x1, qy2: rph.y1,
//		lx1: rp.x1, ly1: rp.y1, lx2: lp.x1, ly2: lp.y1
//	});
//	return area;
//}
//
///**
//	* Returns the degree of a specified value as it pertains to the
//	* total number passed in.
//	*
//	* @public
//	* @method getDegree
//	* @param points {number} the number of sections to split the degrees by
//	* @param total {number} the number that corrosponds to the section to get degrees for
//	* @return {number}
//	*/
//function getDegree(points, section) {
//	return (section * (360 / points)) % 360;
//}
//
//function getPointFromAngle(degree, length, x, y) {
//	// getPointFromAngle will calculate all angles according to the positive x axis
//	// so rotate all degrees by 270 to get the proper alignment of time per degree on the clock
//	degree = (degree + 270) % 360;
//
//	// convert degrees to radians
//	let rads = Snap.rad(degree);
//
//	// calculate x and y
//	let x1 = x + length * Math.cos(rads);
//	let y1 = y + length * Math.sin(rads);
//
//	return { x1, y1 };
//}
//
