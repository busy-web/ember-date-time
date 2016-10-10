/**
 * @module Components
 *
 */
import Ember from 'ember';
import layout from '../../templates/components/interfaces/time-picker';
import moment from 'moment';
import Time from 'busy-utils/time';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import DragDrop from 'ember-paper-time-picker/utils/drag-drop';

/**
 * TODO:
 * snap-utils already includes the snap-svg library.
 * You should have a method in there to create a new Snap() instance.
 */
import Snap from 'snap-svg';
import SnapUtils from 'ember-paper-time-picker/utils/snap-utils';

/**
 * `Component/TimePicker`
 *
 * @class TimePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({
    /**
     * @private
     * @property classNames
     * @type String
     * @default time-picker
     */
    classNames: ['paper-time-picker'],
    layout: layout,

    /**
     * timestamp that is passed in when using date picker
     *
     * @private
     * @property timestamp
     * @type Number
     */
    timestamp: null,

    /**
     * can be passed in so a date before the minDate cannot be selected
     *
     * @private
     * @property minDate
     * @type Number
     * @optional
     */
    minDate: null,

    /**
     * can be passed in so a date after the maxDate cannot be selected
     *
     * @private
     * @property maxDate
     * @type Number
     * @optional
     */
    maxDate: null,

    /**
     * can be passed in as true or false, true sets timepicker to handle unix timestamp * 1000, false sets it to handle unix timestamp
     *
     * @private
     * @property isMilliseconds
     * @type boolean
     * @optional
     */
    isMilliseconds: false,

    /**
     * group of snap svg elements
     *
     * @private
     * @property lastGroup
     * @type Object
     */
    lastGroup: null,

    /**
     * last active minute
     *
     * @private
     * @property lastMinute
     * @type String
     */
    lastMinute: null,

    /**
     * element id for text portion of last active hour
     *
     * @private
     * @property lastHourText
     * @type String
     */
    lastHourText: null,

    /**
     * element id for line portion of last active hour
     *
     * @private
     * @property lastHourLine
     * @type String
     */
    lastHourLine: null,

    /**
     * element id for circle portion of last active hour
     *
     * @private
     * @property lastHourCircle
     * @type String
     */
    lastHourCircle: null,

    /**
     * element id for text portion of last active minute
     *
     * @private
     * @property lastMinuteText
     * @type String
     */
    lastMinuteText: null,

    /**
     * element id for line portion of last active minute
     *
     * @private
     * @property lastMinuteLine
     * @type String
     */
    lastMinuteLine: null,

    /**
     * element id for circle portion of last active minute
     *
     * @private
     * @property lastMinuteCircle
     * @type String
     */
    lastMinuteCircle: null,

    /**
     * current hour of timestamp displayed in clock header
     *
     * @private
     * @property hours
     * @type String
     */
    hours: null,

    /**
     * current minute of timestamp displayed in clock header
     *
     * @private
     * @property minutes
     * @type String
     */
    minutes: null,

    /**
     * current date of timestamp displayed in clock footer
     *
     * @private
     * @property currentDate
     * @type String
     */
    currentDate: null,

    /**
     * if hour or minutes are active
     *
     * @private
     * @property minuteOrHour
     * @type string
     */
    minuteOrHour: null,

    /**
     * checks to see if the current state of the component is DOM editable
     *
     * @private
     * @method currentStatePasses
     * @return {bool} true if the component is in the dom, otherwise false
     */
     currentStatePasses: function()
     {
       return (this.get('_state') === "inDOM");
     },

     /**
      * returns the correct moment objects, depending on if the timestamps are milliseconds or not
      *
      * @private
      * @method getCorrectMomentObjects
      * @return object
      */
      getCorrectMomentObjects: function() {
        let time, minDate, maxDate;
        if (this.get('isMilliseconds')) {
          time = moment(this.get('timestamp'));
          minDate = moment(this.get('minDate'));
          maxDate = moment(this.get('maxDate'));
        } else {
          time = Time.date(this.get('timestamp'));
          minDate = Time.date(this.get('minDate'));
          maxDate = Time.date(this.get('maxDate'));
        }

        return {time, minDate, maxDate};
      },

    /**
     * hides and shows the correct elements once the svgs are inserted
     *
     * TODO:
     * `didInsertElement` requires that `this._super()` is called by anyone
     * who tries to override this class. Instead you can
     * use `myFunction: Ember.on('didInsertElement', function() {` and
     * eliminate the need for calling `this._super`. This should make for a
     * more robust addon for others to extend later.
     *
     * @private
     * @method didInsertElement
     * @constructor
     */
    didInsertElement: function()
    {
      if (this.currentStatePasses())
      {
        this._super();

        this.removeInitialHours();
        this.removeInitialMinutes();
        this.observeMinuteOrHour();

        if(TimePicker.timeIsAm(this.get('timestamp')))
        {
          Ember.$('.am-button').addClass('am-active');
          Ember.$('.pm-button').addClass('pm-inactive');
        }
        else
        {
          Ember.$('.pm-button').addClass('pm-active');
          Ember.$('.am-button').addClass('am-inactive');
        }

      }
    },

    observeMinuteOrHour: Ember.observer('minuteOrHour', function()
    {
      if(this.get('minuteOrHour') === 'minute')
      {
        this.send('minuteHeaderClicked');
      }
      if(this.get('minuteOrHour') === 'hour')
      {
        this.send('hourHeaderClicked');
      }
    }),

    /**
     * initially sets the clocks based on the passed time
     *
     * @private
     * @method setUpClock
     */
    setUpClock: Ember.on('init', Ember.observer('timestamp', function()
    {
      if(!Ember.isNone(this.get('timestamp')))
      {
        let currentHour = TimePicker.formatHourHeader(TimePicker.currentHour(this.get('timestamp')));
        let currentMinute = TimePicker.currentMinute(this.get('timestamp'));
        let currentDate = TimePicker.currentDateFormat(this.get('timestamp'));

        this.set('hours', currentHour);
        this.set('minutes', currentMinute);
        this.set('currentDate', currentDate);
      }
    })),

    /**
     * formats date in bottom left corner
     *
     * @private
     * @method clickableDate
     */
    clickableDate: Ember.observer('timestamp', function()
    {
      let timestamp = moment(this.get('timestamp'));
      let format = timestamp.format('MMM DD, YYYY');

      this.set('currentDate', format);
    }),

    /**
     * applies and removes correct classes to AM PM buttons
     *
     * @private
     * @method observesAmPm
     */
    observesAmPm: Ember.observer('timestamp', function()
    {
      if (this.currentStatePasses())
      {
        if(TimePicker.timeIsAm(this.get('timestamp')))
        {
          Ember.$('.am-button').removeClass('am-inactive');
          Ember.$('.am-button').addClass('am-active');

          Ember.$('.pm-button').removeClass('pm-active');
          Ember.$('.pm-button').addClass('pm-inactive');
        }
        else
        {
          Ember.$('.pm-button').removeClass('pm-inactive');
          Ember.$('.pm-button').addClass('pm-active');

          Ember.$('.am-button').addClass('am-inactive');
          Ember.$('.am-button').removeClass('am-active');
        }
      }
    }),

    /**
     * checks for min/max dates and calls setHourDisabled()
     *
     * @private
     * @method minMaxHourHandler
     */
    minMaxHourHandler: Ember.observer('timestamp', function()
    {
      let maxDate = this.get('maxDate');
      let minDate = this.get('minDate');

      if(!Ember.isNone(minDate) || !Ember.isNone(maxDate))
      {
        if (TimePicker.timeIsAm(this.get('timestamp')))
        {
          let amHours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
          this.setHourDisabled(amHours, 'AM');
        }
        else
        {
          let pmHours = ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
          this.setHourDisabled(pmHours, 'PM');
        }
      }
    }),

    /**
     * makes hours disabled if they are exceeding min/max dates
     *
     * @private
     * @method setHourDisabled
     * @param list {array} list of hours in given meridian
     * @param AmPm {string} AM or PM
     */
    setHourDisabled: function(list, AmPm)
    {
      if (this.currentStatePasses())
      {
        let clock = new Snap('#clocks-hour-svg');
        let maxDate = this.get('maxDate');
        let minDate = this.get('minDate');
        let timestamp = moment(this.get('timestamp'));

        list.forEach(function(hour)
        {
          let clockHour = null;

          if (AmPm === 'AM')
          {
              clockHour = TimePicker.formatHourStrings(hour);
          }
          else
          {
              clockHour = TimePicker.formatHourStrings((parseInt(hour) - 12));
          }

          clock.select('#hour' + clockHour).removeClass('disabled-hour');

          let newHour = timestamp.hour(hour);

          if (!Ember.isNone(minDate) || !Ember.isNone(maxDate))
          {
            if (!(!newHour.isBefore(moment(minDate)) && !newHour.isAfter(moment(maxDate))))
            {
              clock.select('#hour' + clockHour).addClass('disabled-hour');
            }
          }
        });
      }
    },

    /**
     * checks for min/max dates and calls setMinuteDisabled()
     *
     * @private
     * @method minMaxMinuteHandler
     */
    minMaxMinuteHandler: Ember.observer('timestamp', function()
    {
      if (this.currentStatePasses())
      {
        let _this = this;
        let clock = new Snap('#clock-minutes-svg');

        let maxDate = moment(this.get('maxDate'));
        let minDate = moment(this.get('minDate'));
        let timestamp = moment(this.get('timestamp'));

        if (!Ember.isNone(maxDate) || !Ember.isNone(minDate))
        {
          // TODO:
          // allMinutes is an array that you are pushing data into. Therefore the variable
          // istself is not changing. You can initialize this as a `const` instead of `let`.
          let allMinutes = [];

          // TODO:
          // Here you are looping 60 times to create an array that you can then loop
          // through 60 times.
          //
          // Why not just handle the logic from the second loop in the first loop?
          //
          for (let i = 0; i < 60; i++) {
            i = ('0' + i).slice(-2);
            allMinutes.push(i);
          }

          allMinutes.forEach(function(minute)
          {
            let item = TimePicker.formatMinuteStrings(minute);

            clock.select('#sectionMin' + item).removeClass('disabled-minute');

            if (!Ember.isNone(clock.select('#minText' + item)))
            {
              clock.select('#minText' + item).removeClass('disabled-minute');
            }

            let newMinute = timestamp.minute(minute);
            _this.setMinuteDisabled(item, newMinute);
          });
        }
      }
    }),

    /**
     * makes minutes disabled if they are exceeding min/max dates
     *
     * @private
     * @method setMinuteDisabled
     * @param oldMinute {string} minute to be tested
     * @param newMinute {string} minute from the timestamp
     */
    setMinuteDisabled: function(oldMinute, newMinute)
    {
      if (this.currentStatePasses())
      {
        const clock = new Snap('#clock-minutes-svg');
        const maxDate = this.get('maxDate');
        const minDate = this.get('minDate');

        if (!Ember.isNone(minDate) || !Ember.isNone(maxDate))
        {
          if (!(newMinute.isBefore(moment(minDate)) !== true && newMinute.isAfter(moment(maxDate)) !== true))
          {
            if (!Ember.isNone(clock.select('#minText' + oldMinute)))
            {
              clock.select('#minText' + oldMinute).addClass('disabled-minute');
            }
            clock.select('#sectionMin' + oldMinute).addClass('disabled-section');
          }
        }
      }
    },

    /**
     * remove initial circles and lines for hours clock
     *
     * @private
     * @method removeInitialHours
     */
    removeInitialHours: function()
    {
      if (this.currentStatePasses())
      {
        let allHours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
        allHours.forEach(function(item)
        {
          SnapUtils.removeHour(item);
        });

        this.removeLastActiveHour(TimePicker.currentHour(this.get('timestamp')));
        this.minMaxHourHandler();
      }
    },

    /**
     * remove initial circles and lines for minutes clock
     *
     * @private
     * @method removeInitialMinutes
     */
    removeInitialMinutes: function()
    {
      if (this.currentStatePasses())
      {
        let allMinutes = [];
        for (let i = 0; i < 60; i++) {
            i = ('0' + i).slice(-2);
            allMinutes.push(i);
        }

        allMinutes.forEach(function(item)
        {
          SnapUtils.removeMinute(item);
        });

        this.removeLastActiveMinute(TimePicker.currentMinute(this.get('timestamp')));
        this.minMaxMinuteHandler();
      }
    },

    /**
     * keeps the clock hands up to date with the current timestamp
     *
     * @private
     * @method updateClockHands
     */
    updateClockHands: Ember.observer('timestamp', function()
    {
      this.removeLastActiveMinute(TimePicker.formatMinuteStrings(TimePicker.currentMinute(this.get('timestamp'))));
      this.removeLastActiveHour(TimePicker.formatHourStrings(TimePicker.currentHour(this.get('timestamp'))));
    }),

    /**
     * removes the last active hour and displays the now active one
     *
     * @private
     * @method removeLastActiveHour
     * @param hour {string} new active hour
     */
    removeLastActiveHour: function(hour)
    {
      if (this.currentStatePasses())
      {
        let strings = TimePicker.hourStrings(hour);

        if (!Ember.isNone(this.get('lastHourText')) || !Ember.isNone(this.get('lastHourLine')) || !Ember.isNone(this.get('lastHourCircle')))
        {
          let hour = TimePicker.formatHourStrings(this.get('lastHourText'));
          SnapUtils.removeHour(hour);
        }

        SnapUtils.hourTextActivate(hour);

        this.set('lastHourText', strings.text);
        this.set('lastHourLine', strings.line);
        this.set('lastHourCircle', strings.circle);
        this.newDrag(hour);
      }
    },

    /**
     * sets the new minute to active, as well as making the last minute not active
     *
     * @private
     * @method removeLastActiveMinute
     * @param minute {string} new active minute
     */
    removeLastActiveMinute: function(minute)
    {
      if (this.currentStatePasses())
      {
        let strings = TimePicker.minuteStrings(minute);

        if (!Ember.isNone(this.get('lastMinuteText')) || !Ember.isNone(this.get('lastMinuteLine')) || !Ember.isNone(this.get('lastMinuteCircle')))
        {
          let sliceOld = TimePicker.formatMinuteStrings(this.get('lastMinuteText'));
          SnapUtils.removeMinute(sliceOld);
        }

        if (TimePicker.minuteModFive(TimePicker.formatMinuteStrings(minute)))
        {
          SnapUtils.minuteTextActivate(TimePicker.formatMinuteStrings(minute));
        }
        else
        {
          SnapUtils.minuteSectionActivate(TimePicker.formatMinuteStrings(minute));
        }

        this.set('lastMinuteText', strings.text);
        this.set('lastMinuteLine', strings.line);
        this.set('lastMinuteCircle', strings.circle);

        this.minutesDrag(minute);
      }
    },

    /**
     * converts moment object to a unix timestamp, and sets that to the global timestamp
     *
     * @private
     * @method convertToTimestamp
     * @param momentObject {object} moment object that will be the new timestamp
     */
    convertToTimestamp: function(momentObject)
    {
      if (moment.isMoment(momentObject) && momentObject.isValid())
      {
        let reverse = momentObject.unix() * 1000;
        this.set('timestamp', reverse);

      }
      else
      {
        Ember.assert("convertToTimestamp param must be a valid moment object");
      }

    },

    /**
     * sets the correct hour based on the rotated degrees on the hour drag
     *
     * @private
     * @method getHourByDegree
     * @param offset {number} difference of point 1 to point 2 on 360 degree axis
     * @param degree {number} degree from point 1 to point 2
     */
    getHourByDegree: function(offset, degree)
    {
      if (this.currentStatePasses())
      {
        let hour = (((offset / 30) + (Math.round(degree / 30))) % 12);
        let formatHour = TimePicker.formatHourStrings(hour);

        if (this.hourOverMaxMin(formatHour))
        {
          this.removeLastActiveHour(formatHour);
        }
        else
        {
          this.removeLastActiveHour(TimePicker.formatMinuteStrings(this.get('lastHourText')));
        }
      }
    },

    /**
     * sets the correct minute based on the rotated degrees on the minute drag
     *
     * @private
     * @method getMinuteByDegree
     * @param offset {number} difference of point 1 to point 2 on 360 degree axis
     * @param degree {number} degree from point 1 to point 2
     */
    getMinuteByDegree: function(offset, degree)
    {
      if (this.currentStatePasses())
      {
        let minute = (((offset / 6) + (Math.round(degree / 6))) % 60);
        let formatMinute = TimePicker.formatMinuteStrings(minute);
        let formatOldMinute = TimePicker.formatMinuteStrings(this.get('lastMinuteText'));

        if (this.minuteOverMaxMin(formatMinute))
        {
          this.setMinuteToTimestamp(minute);
          SnapUtils.minuteSectionActivate(formatMinute);
          this.removeLastActiveMinute(formatMinute);
        }
        else
        {
          this.removeLastActiveMinute(formatOldMinute);
        }
      }
    },

    /**
     * returns false if the minute exceeds min or max date
     *
     * @private
     * @method minuteOverMaxMin
     * @param minute {number} minute to check if exceeding min/max dates
     * @return {boolean} returns true if the hour exceeds min or max date
     */
    minuteOverMaxMin: function(minute)
    {
      Ember.assert("minuteOverMaxMin param must be an integer or string", typeof minute === 'number'|| typeof minute === 'string');

      let time = moment(this.get('timestamp'));
      let setMin = time.minute(parseInt(minute));

      let maxDate = this.get('maxDate');
      let minDate = this.get('minDate');

      if (!Ember.isNone(minDate) || !Ember.isNone(maxDate))
      {
        if (!setMin.isBefore(moment(minDate)) && !setMin.isAfter(moment(maxDate)))
        {
          return true;
        }
        else
        {
          return false;
        }
      }
      else
      {
        return true;
      }
    },

    /**
     * returns false if the hour exceeds min or max date
     *
     * @private
     * @method hourOverMaxMin
     * @param hour {number} hour to check if exceeding min/max dates
     * @return {boolean} returns true if the hour exceeds min or max date
     */
    hourOverMaxMin: function(hour)
    {
      Ember.assert("hourOverMaxMin param must be an integer or string", typeof hour === 'number' || typeof hour === 'string');

      let timeAm = moment(this.get('timestamp'));
      let setAm = timeAm.hour(parseInt(hour));

      let timePm = moment(this.get('timestamp'));
      let setPm = timePm.hour(parseInt(hour) + 12);

      let maxDate = this.get('maxDate');
      let minDate = this.get('minDate');

      if (!Ember.isNone(minDate) || !Ember.isNone(maxDate))
      {
        if (TimePicker.timeIsAm(this.get('timestamp')))
        {
          if (!setAm.isBefore(moment(minDate)) && !setAm.isAfter(moment(maxDate)))
          {
            return true;
          }
          else
          {
            return false;
          }
        }
        else
        {
          if (!setPm.isBefore(moment(minDate)) && !setPm.isAfter(moment(maxDate)))
          {
            return true;
          }
          else
          {
            return false;
          }
        }
      }
      else
      {
          return true;
      }
    },

    /**
     * sets the timestamp to be the passed minute
     *
     * @private
     * @method setMinuteToTimestamp
     * @param minute {number} minute to be set to timestamp
     */
    setMinuteToTimestamp: function(minute)
    {
      Ember.assert("setMinuteToTimestamp param must be an integer", typeof minute === 'number');

      const timestampObject = moment(this.get('timestamp'));
      const newMin = timestampObject.minute(minute);
      const reverseConversion = newMin.unix() * 1000;

      this.set('timestamp', reverseConversion);
    },

    /**
     * handles all the function events for dragging on the hours clock
     * newDrag must contain start, move and stop functions within it
     *
     * @private
     * @method newDrag
     * @param hour {string} hour thats being dragged
     * @event newDrag
     */
    newDrag: function(hour)
    {
      if (this.currentStatePasses())
      {
        let _this = this;
        let clock = new Snap('#clocks-hour-svg');
        let strings = TimePicker.hourStrings(hour);

        let curHour = clock.select('#' + strings.text);
        let currentAngle = null;
        let newHour = null;

        let center_x = 104.75;
        let center_y = 105;

        /**
         * allows for the hours group to start being dragged
         */
        let start = function() {
          this.data('origTransform', this.transform().local );
          curHour.remove();
          curHour.appendTo(clock);
          curHour.removeClass('interiorWhite');
        };

        /**
         * moves the dial on the hour clock while transforming group
         */
        let move = function(dx,dy,x,y) {

          let points = DragDrop.angleValues(dx,dy,x,y, Ember.$('#centerPointHour'));

          let angle = TimePicker.angle(points.endX, points.endY, points.startX, points.startY);

          let direction = DragDrop.dragDirection(angle, points, strings.text);

          this.attr({
            transform: ('r' + direction + ', ' + center_x + ',' + center_y)
          });

          currentAngle = TimePicker.stringToSlicedInteger(_this.get('lastHourCircle')) * 30;
          newHour = DragDrop.getNewValue(direction);
        };

        /**
         * checks to see where the dragging stops and makes the closest hour active
         */
        let stop = function() {
            _this.getHourByDegree(currentAngle, newHour);
        };

        _this.postDragHours(strings);

        if (!Ember.isNone(this.get('lastGroup')))
        {
            let undragPrevious = this.get('lastGroup');
            undragPrevious.undrag();
        }

        let curHours = clock.select('#' + strings.text);
        let curLine = clock.select('#' + strings.line);
        let curCircle = clock.select('#' + strings.circle);
        let curGroup = clock.g(curLine, curCircle, curHours);

        curGroup.drag(move, start, stop);
        this.set('lastGroup', curGroup);
      }
    },

    /**
     * sets the dragged hour to the global timestamp
     *
     * @private
     * @method postDragHours
     * @param hour {string} hour to be set to timestamp
     * @event postDragHours
     */
    postDragHours(strings)
    {
      if (parseInt(TimePicker.currentHour(this.get('timestamp'))) !== TimePicker.stringToSlicedInteger(strings.text))
      {
        let timestamp = moment(this.get('timestamp'));
        let setHour = null;

        if (TimePicker.timeIsAm(this.get('timestamp')))
        {
          setHour = timestamp.hour(TimePicker.stringToSlicedInteger(strings.text));
          this.convertToTimestamp(setHour);
        }
        else
        {
          setHour = timestamp.hour(TimePicker.stringToSlicedInteger(strings.text) + 12);
          this.convertToTimestamp(setHour);
        }
      }
    },

    /**
     * handles all the function events for dragging on the minutes clock
     * minutesDrag must contain start, move and stop functions within it
     *
     * @private
     * @method minutesDrag
     * @param minute {string} minute thats being dragged
     * @event minutesDrag
     */
    minutesDrag: function(minute)
    {
      if (this.currentStatePasses())
      {
        let _this = this;
        let strings = TimePicker.minuteStrings(minute);

        let clock = new Snap('#clock-minutes-svg');
        let curMinute = clock.select('#' + strings.text);

        let currentAngle = null;
        let newMinute = null;

        let center_x = 104.75;
        let center_y = 105;

        /**
         * allows for the minutes group to start being dragged
         */
        let start = function() {
            this.data('origTransform', this.transform().local );
            if(TimePicker.minuteModFive(TimePicker.stringToSlicedInteger(minute)))
            {
                curMinute.remove();
                curMinute.appendTo(clock);
                curMinute.removeClass('interiorWhite');
            }
        };

        /**
         * moves the dial on the minute clock while transforming group
         */
        let move = function(dx,dy,x,y) {

          let points = DragDrop.angleValues(dx,dy,x,y, Ember.$('#centerPointMinutes'));

          let angle = TimePicker.angle(points.endX, points.endY, points.startX, points.startY);

          let direction = DragDrop.dragDirection(angle, points, strings.text);

          this.attr({
              transform: ('r' + direction + ', ' + center_x + ',' + center_y)
          });

          currentAngle = TimePicker.stringToSlicedInteger(_this.get('lastMinuteCircle')) * 6;
          newMinute = DragDrop.getNewValue(direction);
        };

        /**
         * checks to see where the dragging stops and makes the closest minute active
         */
        let stop = function() {
            _this.getMinuteByDegree(currentAngle, newMinute);
        };

        if (!Ember.isNone(this.get('lastMinute')))
        {
            let undragPrevious = this.get('lastMinute');
            undragPrevious.undrag();
        }

        if (TimePicker.minuteModFive(minute))
        {
            let curMin = clock.select('#' + strings.text);
            let curLine = clock.select('#' + strings.line);
            let curCircle = clock.select('#' + strings.circle);
            let currentSelect = clock.g(curLine, curCircle, curMin);

            currentSelect.drag(move, start, stop);
            this.set('lastMinute', currentSelect);
        }
        else
        {
            let curLine2 = clock.select('#' + strings.line);
            let curCircle2 = clock.select('#' + strings.circle);
            let currentSelect2 = clock.g(curLine2, curCircle2);

            currentSelect2.drag(move, start, stop);
            this.set('lastMinute', currentSelect2);
        }
      }
    },

    actions: {

      /**
       * sets the clicked hour to active and makes the active hour draggable
       *
       * @param hour {string} hour clicked on clock
       * @event clickHour
       */
      clickHour: function(hour)
      {
        if (this.currentStatePasses())
        {
          let timestamp = moment(this.get('timestamp'));

          if (TimePicker.timeIsAm(this.get('timestamp')))
          {
            let setHour = timestamp.hour(TimePicker.stringToSlicedInteger(hour));
            this.convertToTimestamp(setHour);
          }
          else
          {
            let setHour2 = timestamp.hour(TimePicker.stringToSlicedInteger(hour) + 12);
            this.convertToTimestamp(setHour2);
          }
          this.removeLastActiveHour(hour);
        }
      },

      /**
       * handles clicking on minutes
       *
       * @param minute {string} minute clicked on clock
       * @event minuteClicked
       */
      minuteClicked: function(minute)
      {
        if (this.currentStatePasses())
        {
          this.setMinuteToTimestamp(TimePicker.stringToSlicedInteger(minute));
          this.removeLastActiveMinute(TimePicker.formatMinuteStrings(minute));
        }
      },

      /**
       * handles clicking AM, wont allow if it goes under min date
       *
       * @event amClicked
       */
      amClicked: function()
      {
        if (this.currentStatePasses())
        {
          let time = moment(this.get('timestamp'));
          let newTime = time.subtract(12, 'hours');

          if (!TimePicker.timeIsAm(this.get('timestamp')))
          {
            if (!Ember.isNone(this.get('minDate')))
            {
              if (!time.isBefore(this.get('minDate')))
              {
                this.convertToTimestamp(newTime);
              }
            }
            else
            {
              this.convertToTimestamp(newTime);
            }
          }
        }
      },

      /**
       * handles clicking PM, wont allow if it goes over max date
       *
       * @event pmClicked
       */
      pmClicked: function()
      {
        if (this.currentStatePasses())
        {
          let time = moment(this.get('timestamp'));
          let newTime = time.add(12, 'hours');

          if (TimePicker.timeIsAm(this.get('timestamp')))
          {
            if (!Ember.isNone(this.get('maxDate')))
            {
              if (!time.isAfter(this.get('maxDate')))
              {
                this.convertToTimestamp(newTime);
              }
            }
            else
            {
              this.convertToTimestamp(newTime);
            }
          }
        }
      },

      /**
       * handles clicking the hour in the header
       *
       * @event hourHeaderClicked
       */
      hourHeaderClicked: function()
      {
        if (this.currentStatePasses())
        {
          Ember.$('#clocks-hour-svg').removeClass('inactive');
          Ember.$('#clocks-hour-svg').addClass('active');

          Ember.$('#clock-minutes-svg').removeClass('active');
          Ember.$('#clock-minutes-svg').addClass('inactive');

          Ember.$('.outside-hours-container-bottom').attr('style', 'pointer-events: none');
          Ember.$('.outside-hours-container').attr('style', 'pointer-events: all');

          Ember.$('.hours-header').removeClass('inactive');
          Ember.$('.hours-header').addClass('active');

          Ember.$('.minutes-header').removeClass('active');
          Ember.$('.minutes-header').addClass('inactive');

          this.removeInitialHours();
          this.removeLastActiveHour(TimePicker.currentHour(this.get('timestamp')));
        }
      },

      /**
       * handles clicking the minute in the header
       *
       * @event minuteHeaderClicked
       */
      minuteHeaderClicked: function()
      {
        if (this.currentStatePasses())
        {
          Ember.$('#clocks-hour-svg').removeClass('active');
          Ember.$('#clocks-hour-svg').addClass('inactive');

          Ember.$('#clock-minutes-svg').removeClass('inactive');
          Ember.$('#clock-minutes-svg').addClass('active');

          Ember.$('.outside-hours-container').attr('style', 'pointer-events: none');
          Ember.$('.outside-hours-container-bottom').attr('style', 'pointer-events: all');

          Ember.$('.hours-header').addClass('inactive');
          Ember.$('.hours-header').removeClass('active');

          Ember.$('.minutes-header').addClass('active');
          Ember.$('.minutes-header').removeClass('inactive');

          this.removeInitialMinutes();
          this.removeLastActiveMinute(TimePicker.currentMinute(this.get('timestamp')));
        }
      }
    }
});
