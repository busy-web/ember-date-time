/**
 * @module Utils/Clock
 *
 */
import { Snap } from 'snapsvg';

export function getBoundsCenter(width, height) {
	const cx = (width / 2);
	const cy = (height / 2);
	const r = ( height < width ) ? cx : cy;
	return { cx, cy, r };
}

/**
	* Returns the degree of a slice in the circle for a va
	* total number passed in.
	*
	* @public
	* @method getSliceDegree
	* @param totalSlices {number} the total number of slices this circle is broken into
	* @param slice{number} the slice number to get the degrees of
	* @return {number}
	*/
export function getSliceDegree(totalSlices, slice) {
	return (slice * (360 / totalSlices)) % 360;
}

/**
	* Returns the degree of a specified value as it pertains to the
	* total number passed in.
	*
	* @public
	* @method getValueFromDegree
	* @param totalSlices {number} the total number of slices this circle is broken into
	* @param degree {number} the degree to get the number for
	* @return {number}
	*/
export function getSliceFromDegree(totalSlices, degree) {
	// find the slice number
	return (degree * totalSlices) / 360;
}

export function getLineFromDegree(degree, length, x1, y1) {
	// getSliceDegree will calculate all angles according to the positive x axis
	// so rotate all degrees by 270 to get the proper alignment of time per degree on the clock
	degree = (degree + 270) % 360;

	// convert degrees to radians
	let rads = Snap.rad(degree);

	// calculate x and y
	let x2 = x1 + length * Math.cos(rads);
	let y2 = y1 + length * Math.sin(rads);

	return { x1, y1, x2, y2 };
}

/**
 * calculates the angle of a line
 *
 * @method angleOfLine
 * @param x1 {number}
 * @param y1 {number}
 * @param x2 {number}
 * @param y2 {number}
 * @return {number} angle in degrees
 */
export function angleOfLine(x1, y1, x2, y2) {
	let dy = -(y1 - y2); // invert dy for proper x-axis
	let dx = x1 - x2;


	// returns the angle of a line off the x-axis
	let angle = Math.atan2(dy, dx);
	angle *= 180 / Math.PI;

	// invert the angle to make work on the y-axis
	angle = -angle;

	// convert to 360 degree angles
	if (angle < 0) {
		angle += 360;
	}

	// rotate the angle back up to the y-axis 0 coordinate
	angle = (angle + 90) % 360;
	return angle;
}

/**
 * returns the direction of the angle ????
 * was called `calculateDirection`
 *
 * @method getDirection
 * @param startAngle {number}
 * @param endAngle {number}
 * @return {number} angle
 */
export function getDirection(startAngle, endAngle) {
	let angle = endAngle - startAngle;
	if (angle > 180) {
		angle -= 360;
	}
	return angle;
}

export function createSVGPath(totalSlices, degree, x, y, start, end) {
	const sliceRange = ((360 / totalSlices) / 2);
	const ld = (((degree - sliceRange) + 360) % 360); // get the angle for the left bounds
	const rd = ((degree + sliceRange) % 360); // get the angle for the right bounds

	// get the bottom left and right points
	const bl = getLineFromDegree(ld, start, x, y);		// bottom left
	const br = getLineFromDegree(rd, start, x, y);		// bottom right

	// get the top left and right points
	const tl = getLineFromDegree(ld, end, x, y);			// top left
	const tr = getLineFromDegree(rd, end, x, y);			// top right

	// get the point to curve the top bar to.
	const tc = getLineFromDegree(degree, end, x, y);	// top center

	const M = `M${tl.x2} ${tl.y2}`;
	const Q = `Q ${tc.x2} ${tc.y2} ${tr.x2} ${tr.y2}`;
	const L = `L ${br.x2} ${br.y2} ${bl.x2} ${bl.y2} Z`;

	const d = `${M} ${Q} ${L}`;
	return { d };
}
