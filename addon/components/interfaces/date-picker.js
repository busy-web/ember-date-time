/**
 * @module Components
 *
 */
import { A } from '@ember/array';
import { camelize } from '@ember/string';
import { isNone } from '@ember/utils';
import { assert, deprecate } from '@ember/debug';
import { observer, get, set } from '@ember/object';
import { on } from '@ember/object/evented';
import Component from '@ember/component';
import createPaperDate from 'ember-paper-time-picker/utils/paper-date';
import paperTime from 'ember-paper-time-picker/utils/paper-time';
import layout from '../../templates/components/interfaces/date-picker';

/**
 * `Component/DatePicker`
 *
 * @class DatePicker
 * @namespace Components
 * @extends Component
 */
export default Component.extend({

  /**
   * @private
   * @property classNames
   * @type String
   * @default date-picker
   */
  classNames: ['paper-date-picker'],
  layout: layout,

	paperDate: null,

  /**
   * timestamp that is passed in when using date picker
   *
   * @private
   * @property timestamp
   * @type Number
   */
  timestamp: null,

  /**
   * timestamp that controls the dates for the calendar
   *
   * @private
   * @property calendarDate
   * @type Number
   */
  calendarDate: null,

  /**
   * day of the month shown on the calendar header - based off timestamp
   *
   * @private
   * @property day
   * @type String
   */
  day: null,

  /**
   * month of year shown on the calendar header - based off timestamp
   *
   * @private
   * @property month
   * @type String
   */
  month: null,

  /**
   * year shown on the calendar header - based off timestamp
   *
   * @private
   * @property year
   * @type String
   */
  year: null,

  /**
   * month + year string - based off calendarTimestamp
   *
   * @private
   * @property monthYear
   * @type String
   */
  monthYear: null,

  /**
   * array of all days in the current month of calendarTimestamp
   *
   * @private
   * @property daysArray
   * @type Array
   */
  daysArray: null,

  /**
   * based on daysArray, Adds blank days to the front and back of array according to starting day of month
   *
   * @private
   * @property completeDaysArray
   * @type Array
   */
  completeDaysArray: null,

  /**
   * based on completeDaysArray, Adds current day and minDate - maxDate properties
   *
   * @private
   * @property completeArray
   * @type Array
   */
  completeArray: null,

  /**
   * based on completeArray, groups days into 6 week arrays
   *
   * @private
   * @property groupedArray
   * @type Array
   */
  groupedArray: null,

	/**
	 * active state is a string passed to this view to initialize the correct active state
	 * for this view.
	 *
	 * activeState: [day, month, year, monthYear]
	 *
	 * @public
	 * @property activeState
	 * @type string
	 */
	activeState: null,

  /**
   * becomes string 'active' (binded to classes in template) if monthActive is active
   *
   * @private
   * @property monthActive
   * @type String
   */
  monthActive: false,

  /**
   * becomes string 'active' (binded to classes in template) if dayActive is active
   *
   * @private
   * @property monthActive
   * @type dayActive
   */
  dayActive: false,

  /**
   * becomes string 'active' (binded to classes in template) if yearActive is active
   *
   * @private
   * @property yearActive
   * @type String
   */
  yearActive: false,

  /**
   * becomes string 'active' (binded to classes in template) if monthYearActive is active
   *
   * @private
   * @property monthYearActive
   * @type String
   */
  monthYearActive: false,


  /**
   * @private
   * @method init
   * @constructor
   */
  initialize: on('init', function() {
		this.updateTime();
    this.resetCalendarDate();
    this.keepCalendarUpdated();
    this.updateActiveSection();
	}),

	updateTime: observer('paperDate.timestamp', 'paperDate.calendarDate', function() {
		let timestamp = get(this, 'paperDate.timestamp');
		let calendarDate = get(this, 'paperDate.calendarDate');
		if (isNone(calendarDate)) {
			deprecate('passing only timestamp to date-picker is deprecated, please pass calendarDate as well', true, { id: 'date-picker.updateTime', until: 'v2.0' });
			calendarDate = timestamp;
		}
		set(this, 'timestamp', timestamp);
		set(this, 'calendarDate', calendarDate);
	}),

  /**
   * sets the calendarDate to the timestamp and sets the values for the date picker headers
   *
   * @private
   * @method resetCalendarDate
   */
  resetCalendarDate: observer('calendarDate', function() {
		if (!isNone(get(this, 'calendarDate'))) {
			// get moment timestamp
			const time = paperTime(get(this, 'calendarDate'));
			if (paperTime.isValidDate(time)) {
				set(this, 'year', time.format('YYYY'));
				set(this, 'month', time.format('MMM'));
				set(this, 'day', time.format('DD'));
				set(this, 'dayOfWeek', time.format('ddd'));
			} else {
				assert("timestamp must be a valid unix timestamp", false);
			}
		}
  }),

  /**
   * updates to the new active header  (day, month, or year)
   *
   * @private
   * @method updateActiveSection
   */
  updateActiveSection: observer('activeState.state', function() {
		let state = get(this, 'activeState.state');
		if (!isNone(state)) {
			state = camelize(state);
			const statusType = ['day', 'month', 'year', 'monthYear'];

			// ensure the active status applies to the calendar
			if (statusType.indexOf(state) !== -1) {
				// reset active status
				set(this, 'dayActive', false);
				set(this, 'monthActive', false);
				set(this, 'yearActive', false);
				set(this, 'monthYearActive', false);

				// set new active status
				set(this, `${state}Active`, true);
			}
		}
  }),

  /**
   * re configures the calendar when calendarDate is changed, sets the monthYear calendar header
   *
   * @private
   * @method keepCalendarUpdated
   */
  keepCalendarUpdated: observer('calendarDate', 'paperDate.range', function() {
    const calendarObject = paperTime(get(this, 'calendarDate'));
    this.buildDaysArrayForMonth();
    set(this, 'monthYear', calendarObject.format('MMMM YYYY'));
  }),

  /**
   * makes moment objects for each day in month, disables them if they exceed max/min date
   *
   * @private
   * @method buildDaysArrayForMonth
   */
  buildDaysArrayForMonth: function() {
		const calendarDate = get(this, 'calendarDate');
    const minDate =	get(this, 'paperDate.minDate');
    const maxDate = get(this, 'paperDate.maxDate');
		let [ startRange, endRange ] = (get(this, 'paperDate.range') || []);

		const currentCalendar = paperTime(calendarDate);
    const currentTime = paperTime(get(this, 'timestamp'));
    const firstDay = paperTime(calendarDate).startOf('month');
    const lastDay = paperTime(calendarDate).endOf('month').date();

		let start = firstDay.day();
    let currentDay = firstDay;

		if (start === 0) {
			currentDay.subtract(7, 'days');
			start = 7;
		} else {
			currentDay.subtract(start, 'days');
		}

		let daysInCalendar = 28;
		if ((start + lastDay) >= 35) {
			daysInCalendar = 42;
		} else if ((start + lastDay) > 28) {
			daysInCalendar = 35;
		}

		const daysArray = A();
    for (let i=0; i<daysInCalendar; i++) {
			const paper = createPaperDate({timestamp: currentDay.valueOf(), minDate, maxDate, type: 'date'});
			paper.set('weekNumber', Math.ceil((i+1)/7));

			if (paper.get('date').year() === currentCalendar.year()) {
				paper.set('isCurrentYear', true);

				if (paper.get('date').month() === currentCalendar.month()) {
					paper.set('isCurrentMonth', true);
				}
			}

			if (paper.get('date').year() === currentTime.year() && paper.get('date').month() === currentTime.month() && paper.get('date').date() === currentTime.date()) {
				paper.set('isCurrentDay', true);
			}

			if (startRange && endRange) {
				let mili = paper.get('date').valueOf();
				if (startRange <= mili && mili <= endRange) {
					paper.set('isRange', true);

					if (mili === startRange) {
						paper.set('isRangeStart', true);
					}

					if (mili === endRange) {
						paper.set('isRangeEnd', true);
					}
				}
			}

			daysArray.pushObject(paper);
			currentDay.add(1, 'days');
    }

    this.groupByWeeks(daysArray);
  },

   /**
   * groups days into week objects
   *
   * @private
   * @method groupByWeeks
   */
  groupByWeeks(completeArray) {
    let grouped = A([]);

    grouped.pushObject(completeArray.filterBy('weekNumber', 1));
    grouped.pushObject(completeArray.filterBy('weekNumber', 2));
    grouped.pushObject(completeArray.filterBy('weekNumber', 3));
    grouped.pushObject(completeArray.filterBy('weekNumber', 4));
    grouped.pushObject(completeArray.filterBy('weekNumber', 5));
    grouped.pushObject(completeArray.filterBy('weekNumber', 6));

    set(this, 'groupedArray', grouped);
  },

  /**
   * puts days into week objects
   *
   * @private
   * @method inRange
   * @param lower {number} first number in week
   * @param upper {number} last number in week
   * @return {boolean} true if day is in week, otherwise false
   */
  inRange(lower, upper) {
    return function (each, index) {
      return (index >= lower && index < upper);
    };
  },

  /**
   * receives a moment object and sets it to timestamp
   *
   * @private
   * @method setTimestamp
   * @param moment {object} moment object
   */
  setTimestamp(date) {
    set(this, 'timestamp', date.valueOf());
  },

  /**
   * receives a moment object and sets it to calendarTimestamp
   *
   * @private
   * @method setCalendarTimestamp
   * @param moment {object} moment object
   */
  setCalendarDate(date) {
    set(this, 'calendarDate', date.valueOf());
  },

  actions: {

    /**
     * sets the timestamp to the clicked day
     *
     * @param day {object} moment object of the clicked day
     * @event dayClicked
     */
    dayClicked(paper) {
			if (!paper.get('isDisabled')) {
				const day = paper.get('date');
				const newDay = day.date();
				const newMonth = day.month();
				const newYear = day.year();

				let timestamp = paperTime(get(this, 'timestamp'));
				timestamp.year(newYear);
				timestamp.month(newMonth);
				timestamp.date(newDay);

				this.setTimestamp(timestamp);

				this.sendAction('onUpdate', 'days', get(this, 'timestamp'), get(this, 'calendarDate'));
				this.sendAction('onChange', 'days', get(this, 'timestamp'));
			}
    },

    /**
     * subtracts 1 month to the calendarDate
     *
     * @event subtractMonth
     */
    subtractMonth() {
      const calDate = paperTime(get(this, 'calendarDate'));
			calDate.subtract('1', 'months').endOf('month');

			if (!paperTime.isDateBefore(calDate, get(this, 'minDate'))) {
				this.setCalendarDate(calDate);
				set(this, 'calendarActiveSection', 'month-year');
			}

			this.sendAction('onUpdate', 'months', get(this, 'timestamp'), calDate.valueOf());
    },

    /**
     * adds 1 month to the calendarDate
     *
     * @event addMonth
     */
    addMonth() {
      const calDate = paperTime(get(this, 'calendarDate'));
      calDate.add('1', 'months').startOf('month');

			if (!paperTime.isDateAfter(calDate, get(this, 'maxDate'))) {
				this.setCalendarDate(calDate);
				set(this, 'calendarActiveSection', 'month-year');
			}

			this.sendAction('onUpdate', 'months', get(this, 'timestamp'), calDate.valueOf());
    },

		activateHeader(section) {
			set(this, 'calendarActiveSection', section);

			this.sendAction('onUpdate', section, get(this, 'timestamp'), get(this, 'calendarDate'));
		}
  }
});
