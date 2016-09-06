/**
* @module utils
*
*/
import Ember from 'ember';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';

const DragDrop = Ember.Object.extend();
 /**
  * `Util/DragDrop`
  *
  */
export default DragDrop.reopenClass(
{
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
  angleValues: function(dx,dy,x,y, center_point)
  {
    let coordinates = center_point[0].getBoundingClientRect();
    let endX = x - (coordinates.left + 3);
    let endY = -(y - (coordinates.top - 3));
    let startX = endX - dx;
    let startY = endY + dy;

    return {
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY
    };
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
  dragDirection: function(angle, points, unit)
  {
    let slope = (points.startY/points.startX);
    let isForward = points.endY < (slope*points.endX);
    let last2 = parseInt(TimePicker.formatHourStrings(unit));

    if (unit.substr(0, 3) !== 'min')
    {
      if (last2 <= 6 || last2 === 12)
      {
        angle = isForward ? angle : -angle;
      }
      else
      {
        angle = isForward ? -angle : angle;
      }
    }
    else
    {
      if (last2 <= 30 || last2 === 60)
      {
        angle = isForward ? angle : -angle;
      }
      else
      {
        angle = isForward ? -angle : angle;
      }
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
  getNewValue: function(direction)
  {
    let anglePositive = direction > 0;
    let over180 = 180 + Math.abs((180 - Math.abs(direction)));
    let newHour = anglePositive ? direction : over180;

    return newHour;
  }
});
