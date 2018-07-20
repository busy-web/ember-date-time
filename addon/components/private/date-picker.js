/**
 * @module Components
 *
 */
import Component from '@ember/component';
import { A } from '@ember/array';
import { camelize } from '@ember/string';
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';
import { computed, observer, get, set } from '@ember/object';
import _state from '@busy-web/ember-date-time/utils/state';
import _time from '@busy-web/ember-date-time/utils/time';
import layout from '../../templates/components/private/date-picker';
import {
	YEAR_FLAG,
	MONTH_FLAG,
	WEEKDAY_FLAG,
	DAY_FLAG
} from '@busy-web/ember-date-time/utils/constant';

/**
 * `Component/DatePicker`
 *
 * @class DatePicker
 * @namespace Components
 * @extends Component
 */
export default Component.extend({
  classNames: ['busyweb', 'emberdatetime', 'p-date-picker'],
  layout: layout,

	dayKey: DAY_FLAG,
	monthKey: MONTH_FLAG,
	yearKey: YEAR_FLAG,

	stateManager: null,

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
   * becomes string 'active' (binded to classes in template) if monthActive is active
   *
   * @private
   * @property monthActive
   * @type String
   */
  months_active: false,

  /**
   * becomes string 'active' (binded to classes in template) if dayActive is active
   *
   * @private
   * @property monthActive
   * @type dayActive
   */
  days_active: false,

  /**
   * becomes string 'active' (binded to classes in template) if yearActive is active
   *
   * @private
   * @property yearActive
   * @type String
   */
	years_active: false,

	isPrev: true,
	isNext: true,


  /**
   * @private
   * @method init
   * @constructor
   */
	init(...args) {
		this._super(...args);

		this.updateTime();
    this.updateActiveSection();
	},

	updateTime: observer('stateManager.timestamp', 'stateManager.calendarDate', function() {
		const timestamp = get(this, 'stateManager.timestamp');

		let calendarDate = get(this, 'stateManager.calendarDate');
		if (!calendarDate) {
			calendarDate = timestamp;
		}

		if (get(this, 'timestamp') !== timestamp) {
			this.setTimestamp(get(this, 'stateManager.timestamp'));
		}

		if (get(this, 'calendarDate') !== calendarDate) {
			this.setCalendarDate(get(this, 'stateManager.calendarDate') || get(this, 'stateManager.timestamp'));
		}
	}),

  /**
   * updates to the new active header  (day, month, or year)
   *
   * @private
   * @method updateActiveSection
   */
  updateActiveSection: observer('stateManager.section', function() {
		let section = get(this, 'stateManager.section');
		if (!isNone(section)) {
			if (section === WEEKDAY_FLAG) {
				section === DAY_FLAG;
			}

			section = camelize(section);
			const statusType = [DAY_FLAG, MONTH_FLAG, YEAR_FLAG];

			// ensure the active status applies to the calendar
			if (statusType.indexOf(section) !== -1) {
				// reset active status
				statusType.forEach(name => set(this, `${name}_active`, false));

				// set new active status
				set(this, `${section}_active`, true);
			}
		}
  }),

  /**
   * re configures the calendar when calendarDate is changed, sets the monthYear calendar header
   *
   * @private
   * @method monthYear
   */
  monthYear: computed('calendarDate', 'stateManager.range', function() {
    const calendarObject = _time(get(this, 'calendarDate'));
    this.buildDaysArrayForMonth();
    return calendarObject.format('MMMM YYYY');
  }),

  /**
   * makes moment objects for each day in month, disables them if they exceed max/min date
   *
   * @private
   * @method buildDaysArrayForMonth
   */
  buildDaysArrayForMonth: function() {
		const calendarDate = get(this, 'calendarDate');
    const minDate =	get(this, 'stateManager.minDate');
    const maxDate = get(this, 'stateManager.maxDate');
		let [ startRange, endRange ] = (get(this, 'stateManager.range') || []);

		const currentCalendar = _time(calendarDate);
    const currentTime = _time(get(this, 'timestamp'));
    const firstDay = _time(calendarDate).startOf('month');
    const lastDay = _time(calendarDate).endOf('month').date();

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
			const dayState = _state({timestamp: currentDay.valueOf(), minDate, maxDate, type: 'date'});
			dayState.set('weekNumber', Math.ceil((i+1)/7));

			if (dayState.get('date').year() === currentCalendar.year()) {
				dayState.set('isCurrentYear', true);

				if (dayState.get('date').month() === currentCalendar.month()) {
					dayState.set('isCurrentMonth', true);
				}
			}

			if (dayState.get('date').year() === currentTime.year() && dayState.get('date').month() === currentTime.month() && dayState.get('date').date() === currentTime.date()) {
				dayState.set('isCurrentDay', true);
			}

			if (startRange && endRange) {
				let mili = dayState.get('date').valueOf();
				if (startRange <= mili && mili <= endRange) {
					dayState.set('isRange', true);

					if (mili === startRange) {
						dayState.set('isRangeStart', true);
					}

					if (mili === endRange) {
						dayState.set('isRangeEnd', true);
					}
				}
			}

			daysArray.pushObject(dayState);
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
   * @param timestamp {number} date time in milliseconds
   */
  setTimestamp(timestamp) {
    set(this, 'timestamp', timestamp);

		const time = _time(timestamp);
		set(this, 'year', time.format('YYYY'));
		set(this, 'month', time.format('MMM'));
		set(this, 'day', time.format('DD'));
		set(this, 'dayOfWeek', time.format('ddd'));
  },

  /**
   * receives a moment object and sets it to calendarTimestamp
   *
   * @private
   * @method setCalendarDate
   * @param timestamp {number} timestamp in milliseconds
   */
  setCalendarDate(timestamp) {
		this.validateNextPrev(timestamp);
    set(this, 'calendarDate', timestamp);
	},

	/**
	 * validates the next and prev arrows can move in their
	 * respective directions
	 *
	 * @method validateNextPrev
	 * @param time {number} timestamp in milliseconds
	 * @return {void}
	 */
	validateNextPrev(time) {
		// validates the timestamp is inbounds for the
		// given `name: string` (isPrev | isNext) and `time: number`
		const validateTime = (name, npTime) => {
			// sets the prop according to `name: string` and `inBounds: boolean`
			const update = inBounds => set(this, name, inBounds);

			// call update to set the property
			update(
				name === 'isPrev'
					? !this.isBeforeMin(npTime)
					: !this.isAfterMax(npTime)
			);
		};

		// validate that isPrev and isNext will be inBounds
		// if the next or prev arrows are clicked
		validateTime('isPrev', getPrevDate(time));
		validateTime('isNext', getNextDate(time));
	},

	isBeforeMin(time) {
		// if the timestamp gets set to a date before the
		// minDate then allow the back arrow to go back as
		// far as the current timestamp
		if (_time.isDateBefore(get(this, 'timestamp'), time)) {
			return false;
		}
		return _time.isDateBefore(time, get(this, 'stateManager.minDate'));
	},

	isAfterMax(time) {
		// if the timestamp gets set to a date after the
		// maxDate then allow the forward arrow to go forward as
		// far as the current timestamp
		if (_time.isDateAfter(get(this, 'timestamp'), time)) {
			return false;
		}
		return _time.isDateAfter(time, get(this, 'stateManager.maxDate'));
	},

	triggerUpdate(flag) {
		assert(
			`flag is required and must be on of [${YEAR_FLAG}, ${MONTH_FLAG}, ${WEEKDAY_FLAG}, ${DAY_FLAG}]`,
			[YEAR_FLAG, MONTH_FLAG, WEEKDAY_FLAG, DAY_FLAG].indexOf(flag) !== -1
		);

		set(this, 'calendarActiveSection', flag);
		this.sendAction('onUpdate', flag, get(this, 'timestamp'), get(this, 'calendarDate'));
	},

  actions: {

    /**
     * sets the timestamp to the clicked day
     *
     * @param day {object} moment object of the clicked day
     * @event dayClicked
     */
		dayClicked(dayState) {
			if (!get(dayState, 'isDisabled')) {
				const day = get(dayState, 'date');
				const time = _time(get(this, 'timestamp'))
					.year(day.year())
					.month(day.month())
					.date(day.date());

				this.setTimestamp(time.timestamp());
				this.setCalendarDate(time.timestamp());

				this.triggerUpdate(DAY_FLAG);
			}
    },

    /**
     * subtracts 1 month to the calendarDate
     *
     * @event subtractMonth
     */
    subtractMonth() {
			// get next date
			const calTime = getPrevDate(get(this, 'calendarDate'));

			if (!this.isBeforeMin(calTime)) {
				// set calendar date
				this.setCalendarDate(calTime);

				// trigger update
				this.triggerUpdate(MONTH_FLAG);
			}
    },

    /**
     * adds 1 month to the calendarDate
     *
     * @event addMonth
     */
		addMonth() {
			// get next date
			const calTime = getNextDate(get(this, 'calendarDate'));

			if (!this.isAfterMax(calTime)) {
				// set calendar date
				this.setCalendarDate(calTime);

				// trigger update
				this.triggerUpdate(MONTH_FLAG);
			}
    },

		/**
		 * Sets the new header selection
		 *
		 * @event activateHeader
		 */
		activateHeader(section) {
			// trigger update for input to reposition selection
			this.triggerUpdate(section);
		}
  }
});

/**
 * Creates a timestamp for the first day of the next months
 *
 * @method getNextDate
 * @param time {number} timestamp in milliseconds
 * @return {number} timestamp in milliseconds
 */
const getNextDate = time => (
	_time(time).add(1, 'months').startOf('month').timestamp()
);

/**
 * Creates a timestamp for the last day of the previous months
 *
 * @method getPrevDate
 * @param time {number} timestamp in milliseconds
 * @return {number} timestamp in milliseconds
 */
const getPrevDate = time => (
	_time(time).subtract(1, 'month').endOf('month').timestamp()
);
