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

  getNewValue: function(direction)
  {
    let anglePositive = direction > 0;
    let over180 = 180 + Math.abs((180 - Math.abs(direction)));
    let newHour = anglePositive ? direction : over180;

    return newHour;
  }
});
