/**
 * @module Components
 *
 */
import Ember from 'ember';
import { Assert } from 'busy-utils';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import createPaperDate from 'ember-paper-time-picker/utils/paper-date';
import layout from '../../templates/components/interfaces/date-picker';

/**
 * `Component/DatePicker`
 *
 * @class DatePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({

  /**
   * @private
   * @property classNames
   * @type String
   * @default date-picker
   */
  classNames: ['paper-date-picker'],
  layout: layout,

	paperDate: null,
	paperCalendar: null,

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
  initialize: Ember.on('init', function() {
		this.setupTime();
    this.resetCalendarDate();
    this.keepCalendarUpdated();
    this.updateActiveSection();
	}),

	setupTime: Ember.observer('paperDate.timestamp', function() {
		this.set('minDate', this.get('paperDate.minDate'));
		this.set('maxDate', this.get('paperDate.maxDate'));
		this.set('timestamp', this.get('paperDate.timestamp'));
  }),

  /**
   * sets the calendarDate to the timestamp and sets the values for the date picker headers
   *
   * @private
   * @method resetCalendarDate
   */
  resetCalendarDate: Ember.observer('timestamp', function() {
		const timestamp = this.get('timestamp');
		Assert.isNumber(timestamp);

		// get moment timestamp
		const time = TimePicker.getMomentDate(this.get('timestamp'));
		if (TimePicker.isValidDate(time)) {
			this.set('calendarDate', this.get('timestamp'));
			this.set('year', time.format('YYYY'));
			this.set('month', time.format('MMM'));
			this.set('day', time.format('DD'));
			this.set('dayOfWeek', time.format('ddd'));
		} else {
			Assert.throw("timestamp must be a valid unix timestamp");
		}
  }),

  /**
   * updates to the new active header  (day, month, or year)
   *
   * @private
   * @method updateActiveSection
   */
  updateActiveSection: Ember.observer('activeState.state', function() {
		let state = this.get('activeState.state');
		if (!Ember.isNone(state)) {
			state = Ember.String.camelize(state);
			const statusType = ['day', 'month', 'year', 'monthYear'];

			// ensure the active status applies to the calendar
			if (statusType.indexOf(state) !== -1) {
				// reset active status
				this.set('dayActive', false);
				this.set('monthActive', false);
				this.set('yearActive', false);
				this.set('monthYearActive', false);

				// set new active status
				this.set(`${state}Active`, true);
			}
		}
  }),

  /**
   * re configures the calendar when calendarDate is changed, sets the monthYear calendar header
   *
   * @private
   * @method keepCalendarUpdated
   */
  keepCalendarUpdated: Ember.observer('calendarDate', function() {
    const calendarObject = TimePicker.getMomentDate(this.get('calendarDate'));
    this.buildDaysArrayForMonth();
    this.set('monthYear', calendarObject.format('MMMM YYYY'));
  }),

  /**
   * makes moment objects for each day in month, disables them if they exceed max/min date
   *
   * @private
   * @method buildDaysArrayForMonth
   */
  buildDaysArrayForMonth: function() {
		const calendarDate = this.get('calendarDate');
    const minDate =	this.get('minDate');
    const maxDate = this.get('maxDate');

		const currentCalendar = TimePicker.getMomentDate(calendarDate);
    const currentTime = TimePicker.getMomentDate(this.get('timestamp'));
    const firstDay = TimePicker.getMomentDate(calendarDate).startOf('month');
    const lastDay = TimePicker.getMomentDate(calendarDate).endOf('month').date();

		const start = firstDay.day();
    let currentDay = firstDay;
		currentDay.subtract(start, 'days');

		let daysInCalendar = 28;
		if ((start + lastDay) > 35) {
			daysInCalendar = 42;
		} else if ((start + lastDay) > 28) {
			daysInCalendar = 35;
		}

		const daysArray = Ember.A();
    for (let i=0; i<daysInCalendar; i++) {
			const paper = createPaperDate({timestamp: currentDay.valueOf(), minDate, maxDate});
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
    let grouped = Ember.A([]);

    grouped.pushObject(completeArray.filterBy('weekNumber', 1));
    grouped.pushObject(completeArray.filterBy('weekNumber', 2));
    grouped.pushObject(completeArray.filterBy('weekNumber', 3));
    grouped.pushObject(completeArray.filterBy('weekNumber', 4));
    grouped.pushObject(completeArray.filterBy('weekNumber', 5));
    grouped.pushObject(completeArray.filterBy('weekNumber', 6));

    this.set('groupedArray', grouped);
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
    Assert.isNumber(lower);
    Assert.isNumber(upper);

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
    Assert.isMoment(date);
    this.set('timestamp', date.valueOf());
  },

  /**
   * receives a moment object and sets it to calendarTimestamp
   *
   * @private
   * @method setCalendarTimestamp
   * @param moment {object} moment object
   */
  setCalendarDate(date) {
    Assert.isMoment(date);
    this.set('calendarDate', date.valueOf());
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

				Assert.isMoment(day);

				const newDay = day.date();
				const newMonth = day.month();
				const newYear = day.year();

				let timestamp = TimePicker.getMomentDate(this.get('timestamp'));
				timestamp.year(newYear);
				timestamp.month(newMonth);
				timestamp.date(newDay);

				this.setTimestamp(timestamp);

				this.sendAction('onUpdate', 'day', this.get('timestamp'));
			}
    },

    /**
     * subtracts 1 month to the calendarDate
     *
     * @event subtractMonth
     */
    subtractMonth() {
      const calDate = TimePicker.getMomentDate(this.get('calendarDate'));
			calDate.subtract('1', 'months').endOf('month');

			if (!TimePicker.isDateBefore(calDate, this.get('minDate'))) {
				this.setCalendarDate(calDate);
				this.set('calendarActiveSection', 'month-year');
			}

			this.sendAction('onUpdate', 'day', this.get('timestamp'));
    },

    /**
     * adds 1 month to the calendarDate
     *
     * @event addMonth
     */
    addMonth() {
      const calDate = TimePicker.getMomentDate(this.get('calendarDate'));
      calDate.add('1', 'months').startOf('month');

			if (!TimePicker.isDateAfter(calDate, this.get('maxDate'))) {
				this.setCalendarDate(calDate);
				this.set('calendarActiveSection', 'month-year');
			}

			this.sendAction('onUpdate', 'day', this.get('timestamp'));
    },

		activateHeader(section) {
			this.set('calendarActiveSection', section);

			this.sendAction('onUpdate', section, this.get('timestamp'));
		},
  }
});
