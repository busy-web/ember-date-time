/**
* @module Utils/Clock
*
*/
import { isNone } from '@ember/utils';
import { getDirection, angleOfLine } from './math';

/**
	* allows for the hours group to start being dragged
	*/
export function onMoveStart(textNode, removeClass, appendTo, cb=function(){}) {
	return function() {
		this.data('origTransform', this.transform().local);

		if (!isNone(textNode)) {
			textNode.remove();
			textNode.appendTo(appendTo);
			textNode.removeClass(removeClass);
		}
		cb();
	};
}

/**
	* moves the dial on the hour clock while transforming group
	*/
export function onMove(angleStart, cx, cy, x, y, cb=function(){}) {
	return function(dx, dy) {
		const nx = x + dx;
		const ny = y + dy;

		// get angle of line from center x, y to new nx, ny
		const angleEnd = angleOfLine(nx, ny, cx, cy);

		// get the rotational direction from the startAngle to the new endAngle
		const direction = getDirection(angleStart, angleEnd);

		// add SnapSVG transform for movement
		this.attr({ transform: `r${direction}, ${cx}, ${cy}` });
		cb(angleEnd);
	};
}

/**
	* checks to see where the dragging stops and makes the closest hour active
	*/
export function onMoveStop(target, cb=function(){}) {
	return function(evt) {
		cb(target, evt);
	}
}

