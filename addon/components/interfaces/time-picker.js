/**
 * @module Components
 *
 */
import Ember from 'ember';
import layout from '../../templates/components/interfaces/time-picker';
import moment from 'moment';
import Time from 'busy-utils/time';
import Assert from 'busy-utils/assert';
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
     * @private
     * @method didInsertElement
     * @constructor
     */
    insertTimePicker: Ember.on('didInsertElement', function()
    {
      let timestamps = this.getCorrectMomentObjects();

      if (this.currentStatePasses()) {
        this.removeInitialHours();
        this.removeInitialMinutes();
        this.observeMinuteOrHour();

        if(TimePicker.timeIsAm(timestamps.time)) {
          Ember.$('.am-button').addClass('am-active');
          Ember.$('.pm-button').addClass('pm-inactive');
        } else {
          Ember.$('.pm-button').addClass('pm-active');
          Ember.$('.am-button').addClass('am-inactive');
        }
      }
    }),

    observeMinuteOrHour: Ember.observer('minuteOrHour', function()
    {
      if(this.get('minuteOrHour') === 'minute') {
        this.send('minuteHeaderClicked');
      }
      if(this.get('minuteOrHour') === 'hour') {
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
      let timestamps = this.getCorrectMomentObjects();

      if (!Ember.isNone(this.get('timestamp'))) {
        let currentHour = TimePicker.formatHourHeader(TimePicker.currentHour(timestamps.time));
        let currentMinute = TimePicker.currentMinute(timestamps.time);
        let currentDate = TimePicker.currentDateFormat(timestamps.time);

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
      let timestamps = this.getCorrectMomentObjects();
      let format = timestamps.time.format('MMM DD, YYYY');

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
      let timestamps = this.getCorrectMomentObjects();

      if (this.currentStatePasses()) {
        if(TimePicker.timeIsAm(timestamps.time)) {
          Ember.$('.am-button').removeClass('am-inactive');
          Ember.$('.am-button').addClass('am-active');

          Ember.$('.pm-button').removeClass('pm-active');
          Ember.$('.pm-button').addClass('pm-inactive');
        } else {
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
      let timestamps = this.getCorrectMomentObjects();
      let maxDate = this.get('maxDate');
      let minDate = this.get('minDate');

      if(!Ember.isNone(minDate) || !Ember.isNone(maxDate)) {
        if (TimePicker.timeIsAm(timestamps.time)) {
          let amHours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
          this.setHourDisabled(amHours, 'AM');
        } else {
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
      let timestamps = this.getCorrectMomentObjects();

      if (this.currentStatePasses()) {
        let clock = new Snap('#clocks-hour-svg');
        let maxDate = this.get('maxDate');
        let minDate = this.get('minDate');

        list.forEach(function(hour) {
          let clockHour = null;

          if (AmPm === 'AM') {
            clockHour = TimePicker.formatHourStrings(hour);
          } else {
            clockHour = TimePicker.formatHourStrings((parseInt(hour, 10) - 12));
          }

          clock.select('#hour' + clockHour).removeClass('disabled-hour');
          let newHour = timestamps.time.hour(hour);

          if (!Ember.isNone(minDate) || !Ember.isNone(maxDate)) {
            if (!(!newHour.isBefore(timestamps.minDate) && !newHour.isAfter(timestamps.maxDate))) {
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
      let timestamps = this.getCorrectMomentObjects();

      if (this.currentStatePasses())
      {
        let _this = this;
        let clock = new Snap('#clock-minutes-svg');

        if (!Ember.isNone(this.get('maxDate')) || !Ember.isNone(this.get('minDate'))) {
          for (let minute = 0; minute < 60; minute++)
          {
            minute = ('0' + minute).slice(-2);
            let item = TimePicker.formatMinuteStrings(minute);

            clock.select('#sectionMin' + item).removeClass('disabled-minute');
            if (!Ember.isNone(clock.select('#minText' + item))) {
              clock.select('#minText' + item).removeClass('disabled-minute');
            }

            let newMinute = timestamps.time.minute(minute);
            _this.setMinuteDisabled(item, newMinute);
          }
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
      let timestamps = this.getCorrectMomentObjects();

      if (this.currentStatePasses())
      {
        const clock = new Snap('#clock-minutes-svg');
        const maxDate = this.get('maxDate');
        const minDate = this.get('minDate');

        if (!Ember.isNone(minDate) || !Ember.isNone(maxDate)) {
          if (!(newMinute.isBefore(timestamps.minDate) !== true && newMinute.isAfter(timestamps.maxDate) !== true)) {
            if (!Ember.isNone(clock.select('#minText' + oldMinute))) {
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
      let timestamps = this.getCorrectMomentObjects();

      if (this.currentStatePasses()) {
        let allHours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];

        allHours.forEach(function(item) {
          SnapUtils.removeHour(item);
        });

        this.removeLastActiveHour(TimePicker.currentHour(timestamps.time));
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
      let timestamps = this.getCorrectMomentObjects();

      if (this.currentStatePasses()) {

        for (let minute = 0; minute < 60; minute++) {
            minute = ('0' + minute).slice(-2);
            SnapUtils.removeMinute(minute);
        }

        this.removeLastActiveMinute(TimePicker.currentMinute(timestamps.time));
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
      let timestamps = this.getCorrectMomentObjects();

      this.removeLastActiveMinute(TimePicker.formatMinuteStrings(TimePicker.currentMinute(timestamps.time)));
      this.removeLastActiveHour(TimePicker.formatHourStrings(TimePicker.currentHour(timestamps.time)));
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
      if (this.currentStatePasses()) {
        let strings = TimePicker.hourStrings(hour);

        if (!Ember.isNone(this.get('lastHourText')) || !Ember.isNone(this.get('lastHourLine')) || !Ember.isNone(this.get('lastHourCircle'))) {
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
      if (this.currentStatePasses()) {
        let strings = TimePicker.minuteStrings(minute);

        if (!Ember.isNone(this.get('lastMinuteText')) || !Ember.isNone(this.get('lastMinuteLine')) || !Ember.isNone(this.get('lastMinuteCircle'))) {
          let sliceOld = TimePicker.formatMinuteStrings(this.get('lastMinuteText'));
          SnapUtils.removeMinute(sliceOld);
        }

        if (TimePicker.minuteModFive(TimePicker.formatMinuteStrings(minute))) {
          SnapUtils.minuteTextActivate(TimePicker.formatMinuteStrings(minute));
        } else {
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
      Assert.isMoment(momentObject);

      if (this.get('isMilliseconds')) {
        let reverse = Time.timestamp(momentObject);
        this.set('timestamp', reverse);
      } else {
        let reverse = momentObject.unix();
        this.set('timestamp', reverse);
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
      if (this.currentStatePasses()) {
        let hour = (((offset / 30) + (Math.round(degree / 30))) % 12);
        let formatHour = TimePicker.formatHourStrings(hour);

        if (this.hourOverMaxMin(formatHour)) {
          this.removeLastActiveHour(formatHour);
        } else {
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
      if (this.currentStatePasses()) {
        let minute = (((offset / 6) + (Math.round(degree / 6))) % 60);
        let formatMinute = TimePicker.formatMinuteStrings(minute);
        let formatOldMinute = TimePicker.formatMinuteStrings(this.get('lastMinuteText'));

        if (this.minuteOverMaxMin(formatMinute)) {
          this.setMinuteToTimestamp(minute);
          SnapUtils.minuteSectionActivate(formatMinute);
          this.removeLastActiveMinute(formatMinute);
        } else {
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
      let timestamps = this.getCorrectMomentObjects();
      let timestamps_min = this.getCorrectMomentObjects();

      if (typeof minute === 'string' || typeof minute === 'number') {
        let setMin = timestamps_min.time.minute(parseInt(minute, 10));
        let maxDate = this.get('maxDate');
        let minDate = this.get('minDate');

        if (!Ember.isNone(minDate) || !Ember.isNone(maxDate)) {
          if (!setMin.isBefore(timestamps.minDate) && !setMin.isAfter(timestamps.maxDate)) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      } else {
        Assert.throw("minuteOverMaxMin param must be an integer or string");
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
      if (typeof hour === 'number' || typeof hour === 'string') {
        let timestamps = this.getCorrectMomentObjects();
        let timestamps_am = this.getCorrectMomentObjects();
        let timestamps_pm = this.getCorrectMomentObjects();

        let timeAm = timestamps_am.time;
        let setAm = timeAm.hour(parseInt(hour, 10));

        let timePm = timestamps_pm.time;
        let setPm = timePm.hour(parseInt(hour, 10) + 12);

        let maxDate = this.get('maxDate');
        let minDate = this.get('minDate');

        if (!Ember.isNone(minDate) || !Ember.isNone(maxDate)) {
          if (TimePicker.timeIsAm(timestamps.time)) {
            if (!setAm.isBefore(timestamps.minDate) && !setAm.isAfter(timestamps.maxDate)) {
              return true;
            } else {
              return false;
            }
          } else {
            if (!setPm.isBefore(timestamps.minDate) && !setPm.isAfter(timestamps.maxDate)) {
              return true;
            } else {
              return false;
            }
          }
        } else {
          return true;
        }
      } else {
        Assert.throw("hourOverMaxMin param must be an integer or string");
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
      Assert.isNumber(minute);

      let timestamps = this.getCorrectMomentObjects();
      let newMin = timestamps.time.minute(minute);

      this.convertToTimestamp(newMin);
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

        if (!Ember.isNone(this.get('lastGroup'))) {
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
      let timestamps = this.getCorrectMomentObjects();

      if (parseInt(TimePicker.currentHour(timestamps.time), 10) !== TimePicker.stringToSlicedInteger(strings.text)) {
        let timestamp = timestamps.time;
        let setHour = null;

        if (TimePicker.timeIsAm(timestamps.time)) {
          setHour = timestamp.hour(TimePicker.stringToSlicedInteger(strings.text));
          this.convertToTimestamp(setHour);
        } else {
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

        if (!Ember.isNone(this.get('lastMinute'))) {
            let undragPrevious = this.get('lastMinute');
            undragPrevious.undrag();
        }

        if (TimePicker.minuteModFive(minute))  {
            let curMin = clock.select('#' + strings.text);
            let curLine = clock.select('#' + strings.line);
            let curCircle = clock.select('#' + strings.circle);
            let currentSelect = clock.g(curLine, curCircle, curMin);

            currentSelect.drag(move, start, stop);
            this.set('lastMinute', currentSelect);
        } else {
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
        let timestamps = this.getCorrectMomentObjects();

        if (this.currentStatePasses()) {
          if (TimePicker.timeIsAm(timestamps.time)) {
            let setHour = timestamps.time.hour(TimePicker.stringToSlicedInteger(hour));
            this.convertToTimestamp(setHour);
          } else {
            let setHour2 = timestamps.time.hour(TimePicker.stringToSlicedInteger(hour) + 12);
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
        if (this.currentStatePasses()) {
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
        let timestamps = this.getCorrectMomentObjects();
        let changeable_timestamps = this.getCorrectMomentObjects();

        if (this.currentStatePasses()) {
          let newTime = changeable_timestamps.time;
              newTime.subtract(12, 'hours');

          if (!TimePicker.timeIsAm(timestamps.time)) {
            if (!Ember.isNone(this.get('minDate'))) {
              if (!newTime.isBefore(timestamps.minDate)) {
                this.convertToTimestamp(newTime);
              }
            } else {
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
        let timestamps = this.getCorrectMomentObjects();
        let changeable_timestamps = this.getCorrectMomentObjects();

        if (this.currentStatePasses()) {
          let newTime = changeable_timestamps.time;
              newTime.add(12, 'hours');

          if (TimePicker.timeIsAm(timestamps.time)) {
            if (!Ember.isNone(this.get('maxDate'))) {
              if (!newTime.isAfter(timestamps.maxDate)) {
                this.convertToTimestamp(newTime);
              }
            } else {
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
        let timestamps = this.getCorrectMomentObjects();

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
          this.removeLastActiveHour(TimePicker.currentHour(timestamps.time));
        }
      },

      /**
       * handles clicking the minute in the header
       *
       * @event minuteHeaderClicked
       */
      minuteHeaderClicked: function()
      {
        let timestamps = this.getCorrectMomentObjects();

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
          this.removeLastActiveMinute(TimePicker.currentMinute(timestamps.time));
        }
      }
    }
});
