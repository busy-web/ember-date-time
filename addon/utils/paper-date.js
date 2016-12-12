/**
 * @module Utils
 *
 */
import Ember from 'ember';
import { Assert } from 'busy-utils';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';

/**
 * `EmberPaperDatePicker/Utils/PaperDate`
 *
 * @class PaperDate
 */
const PaperDate = Ember.Object.extend({
	/**
	 * Must be a timestamp in milliseconds
	 *
	 * @public
	 * @property timestamp
	 * @type number
	 */
	timestamp: null,

	_backupTimestamp: null,

	minDate: null,
	maxDate: null,

	/**
	 * Must be a moment date object
	 *
	 * @public
	 * @property date
	 * @type Moment
	 */
	date: null,

	dateSetter: Ember.observer('timestamp', function() {
		const date = TimePicker.getMomentDate(this.get('timestamp'));
		this.set('date', date);
	}),

	/**
	 * The date objects day of the month
	 *
	 * @public
	 * @property dayOfMonth
	 * @type number
	 */
	dayOfMonth: Ember.computed('timestamp', function() {
		return this.get('date').date();
	}),

	/**
	 * Boolean value set to true if the date is before the minDate
	 *
	 * @public
	 * @property isBefore
	 * @type boolean
	 */
	isBefore: Ember.computed('minDate', 'timestamp', function() {
		let isBefore = false;
		if (!Ember.isNone(this.get('timestamp'))) {
			isBefore = TimePicker.isDateBefore(this.get('date'), this.get('minDate'));
		}
		return isBefore;
	}),

	/**
	 * Boolean value set to true if the date is after the maxDate
	 *
	 * @public
	 * @property isAfter
	 * @type boolean
	 */
	isAfter: Ember.computed('maxDate', 'timestamp', function() {
		let isAfter = false;
		if (!Ember.isNone(this.get('timestamp'))) {
			isAfter = TimePicker.isDateAfter(this.get('date'), this.get('maxDate'));
		}
		return isAfter;
	}),

	add(value, type) {
		const date = this.get('date');
		date.add(value, type);

		if(!TimePicker.isDateAfter(date, this.get('maxDate'))) {
			this.set('timestamp', date.valueOf());
		} else {
			date.subtract(value, type);
		}
	},

	subtract(value, type) {
		const date = this.get('date');
		date.subtract(value, type);

		if(!TimePicker.isDateBefore(date, this.get('minDate'))) {
			this.set('timestamp', date.valueOf());
		} else {
			date.add(value, type);
		}
	},

	/**
	 * Boolean value set to true if this is the current date sent in
	 * by the user
	 *
	 * @public
	 * @property isCurrentDay
	 * @type boolean
	 */
	isCurrentDay: false,

	isCurrentMonth: false,

	isCurrentYear: false,

	/**
	 * the week this date falls under in the month
	 *
	 * @public
	 * @property weekNumber
	 * @type number
	 */
	weekNumber: null,

	/**
	 * Computed property returns true if this date should be disabled
	 *
	 * @public
	 * @property isDisabled
	 * @type boolean
	 */
	isDisabled: Ember.computed('isBefore', 'isAfter', function() {
		return (this.get('isBefore') || this.get('isAfter'));
	}),

	resetTime() {
		const backup = this.get('_backupTimestamp');
		if (!Ember.isNone(backup)) {
			this.set('timestamp', backup);
			this.set('_backupTimestamp', backup);
		}
		return this;
	},

	set(key, value) {
		if (key === 'timestamp') {
			this.set('_backupTimestamp', this.get('timestamp'));
		}
		return this._super(key, value);
	},
});

export default function paper(options) {
	Assert.isObject(options);

	const date = PaperDate.create();

	// changed to Assert.test in and removed if statements that are not needed.
	// minDate and maxDate should be null or a timestamp
	if (options.minDate) {
		Assert.test("minDate must be a valid timestamp", TimePicker.isValidTimestamp(options.minDate));
	}

	if (options.maxDate) {
		Assert.test("maxDate must be a valid timestamp", TimePicker.isValidTimestamp(options.maxDate));
	}

	// timestamp must be set to a timestamp
	Assert.test("timestamp must be a valid number in milliseconds representing a date", TimePicker.isValidTimestamp(options.timestamp));

	date.setProperties(options);
	return date;
}
