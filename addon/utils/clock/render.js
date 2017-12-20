/**
 * @module Utils/Clock
 *
 */
import $ from 'jquery';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';
//import clockData from './data';
import { Snap } from 'snapsvg';

export default function render(target, data, opts) {
	let svg = target.$('.svg-clock-container');
	if (!svg || !svg.length) {
		svg = createSVGElement(get(opts, 'title'), data);
		target.$().append(svg);
	}

	return updateSvg(target, svg, data);
	//if (!snap) {
	//	return buildSvg(target, data);
	//} else {
	//	return updateSvg(target, snap, data);
	//}
}

function updateSvg(target, svg, data) {
	const clock = new Snap(svg.get(0));
	clock.attr({viewBox: get(data, 'viewBox').join(' ')});

	const circle = clock.select('.clock-background');
	circle.attr(get(data, 'clock'));

	const centerPoint = clock.select('.clock-center');
	centerPoint.attr(get(data, 'center'));

	get(data, 'points').forEach(point => {
		let value = get(point, 'value');
		const line = clock.select(`.line-${value}`);
		line.attr(get(point, 'line'));

		// calculate circle coords
		const circle = clock.select(`.circle-${value}`);
		circle.attr(get(point, 'circle'));

		// calculate section position for click areas on minutes
		const section = clock.select(`.click-${value}`);
		section.attr({d: get(point, 'area.d')});

		section.unclick();
		section.click(function() {
			target.clickHandler(point);
		});

		// calculate text position if there is a text
		// at this number
		const text = clock.select(`.text-${value}`);
		if (!isEmpty(text)) {
			const bounds = text.node.getBBox();
			const nx = (get(point, 'x') - (bounds.width/2));
			const ny = (get(point, 'y') + (bounds.height/3));
			text.attr('transform', `translate(${nx}, ${ny})`);
		}

		if (get(point, 'selected')) {
			circle.addClass('selected');
			line.addClass('selected');
			section.addClass('selected');
			if (!isEmpty(text)) {
				text.addClass('selected');
			}
		} else {
			circle.removeClass('selected');
			line.removeClass('selected');
			section.removeClass('selected');
			if (!isEmpty(text)) {
				text.removeClass('selected');
			}
		}
	});
	return clock;
}

function createSVGElement(title, data) {
	let svg = `<svg class="svg-clock-container" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg">`;
	svg += `<defs></defs><title>${title}</title>`;
	svg += `<circle class="clock-background cls-dark-fill" />`;
	svg += `<circle class="clock-center cls-bright-fill" />`;

	get(data, 'points').forEach(point => {
		svg += `<path class="click-${get(point, 'value')} cls-transparent cls-cursor" />`;
		svg += `<line class="line-${get(point, 'value')} cls-bright-stroke cls-line" />`;
		svg += `<circle class="circle-${get(point, 'value')} cls-bright-fill cls-cursor" />`;
		if (get(point, 'isVisible')) {
			svg += `<text class="text-${get(point, 'value')} cls-text cls-cursor">${get(point, 'value')}</text>`;
		}
	});

	svg += `</svg>`;
	return $(svg);
}

//function buildSvg(target, data) {
//	const svg = svgElement(data);
//	addMeta(svg);
//	addPoints(target, svg, data);
//
//	container.html('');
//	container.append(svg);
//
//	return new Snap(svg);
//}
//
//function svgElement(data) {
//	return $(`<svg class="svg-clock-container" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="${get(data, 'viewBox')}"></svg>`);
//}
//
//function addMeta(svg, data) {
//	svg.append('<defs></defs>');
//	svg.append(`<title>${get(data, 'title')}</title>`);
//}
//
//function addBackground(svg, data) {
//	svg.append(`<circle class="clock-background cls-dark-fill" cx="${get(data, 'clock.cx')}" cy="${get(data, 'clock.cy')}" r="${get(data, 'clock.r')}"/>`);
//	svg.append(`<circle class="clock-center cls-bright-fill" cx="${get(data, 'center.cx')}" cy="${get(data, 'center.cx')}" r="${get(data, 'center.r')}"/>`);
//}
//
//function addPoints(target, svg, data) {
//	let points = get(data, 'points');
//	points.forEach(point => {
//		const path = $(`<path class="click-${get(point, 'value')} cls-transparent cls-cursor" d="${get(point, 'area.d')}" {{!action 'clicked' point}}/>`);
//		path.onclick = () => target.clickHandler(point);
//		svg.append(path);
//
//		svg.append(`<line class="line-${get(point, 'value')} cls-bright-stroke cls-line" x1="${get(point, 'line.x1')}" y1="${get(point, 'line.y1')}" x2="${get(point, 'line.x2')}" y2="${get(point, 'line.y2')}"/>`);
//		svg.append(`<circle class="circle-${get(point, 'value')} cls-bright-fill cls-cursor" cx="${get(point, 'circle.cx')}" cy="${get(point, 'circle.cy')}" r="${get(point, 'circle.r')}" />`);
//		if (get(point, 'isVisible')) {
//			svg.append(`<text class="text-${get(point, 'value')} cls-text cls-cursor" transform="${get(point, 'translate')}">${get(point, 'value')}</text>`);
//		}
//	});
//}
