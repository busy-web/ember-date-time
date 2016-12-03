/**
* @module utils
*
*/
import Ember from 'ember';

/***/
const DragDrop = Ember.Object.extend();

 /**
  * `Util/DragDrop`
  *
  */
export default DragDrop.reopenClass({

	lineAngle(x1, y1, x2, y2) {
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
	},

	calculateDirection(startAngle, endAngle) {
		let angle = endAngle - startAngle;
		if (angle > 180) {
			angle -= 360;
		}
		return angle;
	},

  /**
   * returns the x,y coordinates of starting and ending points relative to center_point
   *
   * @private
   * @method angleValues
   * @param dx {number}
   * @param dy {number}
   * @param x {number}
   * @param y {string}
   * @return {object} starting and ending x,y points
   */
  angleValues(dx,dy,x,y, center_point) {
    const coordinates = center_point[0].getBoundingClientRect();
    const endX = x - (coordinates.left + 3);
    const endY = -(y - (coordinates.top - 3));
    const startX = endX - dx;
    const startY = endY + dy;

    return { startX, startY, endX, endY };
  },

  /**
   * returns the new angle
   *
   * @private
   * @method dragDirection
   * @param angle {number}
   * @param points {object} return value of angleValues
   * @param unit {string} last active minute/hour
   * @return angle {number} new angle
   */
  dragDirection(angle, points) {
    const slope = points.startY / points.startX;
    const isForward = points.endY < (slope * points.endX);

		if (points.startX > 0) {
			angle = isForward ? angle : -angle;
		} else {
			angle = isForward ? -angle : angle;
		}
    return angle;
  },

  /**
   * returns the new hour or minute after being dragged
   *
   * @private
   * @method getNewValue
   * @param direction {number}
   * @return {number} new minute or hour post drag
   */
  getNewValue(direction) {
    const anglePositive = direction > 0;
    const over180 = 180 + Math.abs((180 - Math.abs(direction)));

		return (anglePositive ? direction : over180);
  }
});
