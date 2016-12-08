/**
 * @module Utils
 *
 */
import Ember from 'ember';

/**
 * `EmberPaperDatePicker/Utils/PaperDate`
 *
 * @class PaperDate
 */
export default Ember.Object.extend({
	/**
	 * Must be a timestamp in milliseconds
	 *
	 * @public
	 * @property timestamp
	 * @type number
	 */
	timestamp: null,

	/**
	 * Must be a timestamp in seconds
	 *
	 * @public
	 * @property unix
	 * @type number
	 */
	unix: null,

	/**
	 * Must be a moment date object
	 *
	 * @public
	 * @property date
	 * @type Moment
	 */
	date: null,

	/**
	 * The date objects day of the month
	 *
	 * @public
	 * @property dayOfMonth
	 * @type number
	 */
	dayOfMonth: null,

	/**
	 * Boolean value set to true if the date is before the minDate
	 *
	 * @public
	 * @property isBefore
	 * @type boolean
	 */
	isBefore: false,

	/**
	 * Boolean value set to true if the date is after the maxDate
	 *
	 * @public
	 * @property isAfter
	 * @type boolean
	 */
	isAfter: false,

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
	})
});
