/**
 * @module Components
 *
 */
import Ember from 'ember';
import layout from '../templates/components/paper-datetime-picker';
import moment from 'moment';
import { Assert } from 'busy-utils';

/**
 * `Component/paper-datetime-picker`
 *
 * @class PaperDatetimePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({
	/**
	 * @private
	 * @property classNames
	 * @type String
	 * @default paper-datetime-picker
	 */
	classNames: ['paper-datetime-picker'],
	layout: layout,

	/**
	 * timestamp that is passed in when using paper-datetime-picker
	 *
	 * @private
	 * @property timestamp
	 * @type Number
	 */
	timestamp: null,

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
	 * can be passed in so a date before the minDate cannot be selected
	 *
	 * @private
	 * @property minDate
	 * @type Number
	 * @optional
	 */
	minDate: null,

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
	 * Merdian (AM/PM) that is shown in the input bar
	 *
	 * @private
	 * @property timestampMeridian
	 * @type String
	 */
	timestampMeridian: null,

	/**
	 * minutes that are shown in the input bar
	 *
	 * @private
	 * @property timestampMinutes
	 * @type String
	 */
	timestampMinutes: null,

	/**
	 * hours that are shown in the input bar
	 *
	 * @private
	 * @property timestampHours
	 * @type String
	 */
	timestampHours: null,

	/**
	 * days that are shown in the input bar
	 *
	 * @private
	 * @property timestampDays
	 * @type String
	 */
	timestampDays: null,

	/**
	 * months that are shown in the input bar
	 *
	 * @private
	 * @property timestampMonths
	 * @type String
	 */
	timestampMonths: null,

	/**
	 * years that are shown in the input bar
	 *
	 * @private
	 * @property timestampYears
	 * @type String
	 */
	timestampYears: null,

	/**
	 * bool for if the dialog is being shown or not
	 *
	 * @private
	 * @property showDialogTop
	 * @type bool
	 */
	showDialogTop: false,

	/**
	 * bool for if the dialog is being shown or not
	 *
	 * @private
	 * @property showDialog
	 * @type bool
	 */
	showDialog: false,

	/**
	 * string of the new active element on the picker
	 *
	 * @private
	 * @property activeSection
	 * @type string
	 */
	activeSection: null,

	/**
	 * value changes if the active section is changed to a different value or the SAME value
	 *
	 * @private
	 * @property updateActive
	 * @type Boolean
	 */
	updateActive: true,

	/**
	 * value shared with combined picker to destroy both dialogs when closed
	 *
	 * @private
	 * @property destroyElements
	 * @type Boolean
	 */
	destroyElements: false,

	/**
	 * value thats used to only allow one action to be sent each keyup/heydown for calendar
	 *
	 * @private
	 * @property keyHasGoneUp
	 * @type Boolean
	 */
	keyHasGoneUp: true,

	closeOnTab: null,

	/**
	 * checks if timestamp is valid calls updateInputValues
	 *
	 * @private
	 * @method init
	 * @constructor
	 */
	init() {
		this._super(...arguments);

		// make sure isMilliseconds is set to a boolean value.
		Assert.isBoolean(this.get('isMilliseconds'));

		// changed to Assert.test in and removed if statements that are not needed.
		// minDate and maxDate should be null or a unix timestamp
		Assert.test("minDate must be a valid unix timestamp", Ember.isNone(this.get('minDate')) || (this.isValidTimestamp(this.get('minDate')) && this.isValidMomentObject(this.getMomentDate(this.get('minDate')))));
		Assert.test("maxDate must be a valid unix timestamp", Ember.isNone(this.get('maxDate')) || (this.isValidTimestamp(this.get('maxDate')) && this.isValidMomentObject(this.getMomentDate(this.get('maxDate')))));

		// timestamp must be set to a unix timestamp
		Assert.test("timestamp must be a valid unix timestamp", !Ember.isNone(this.get('timestamp')) && this.isValidTimestamp(this.get('timestamp')) && this.isValidMomentObject(this.getMomentDate(this.get('timestamp'))));

		this.updateInputValues();
	},

	/**
	 * Check if a timestamp is a valid date timestamp
	 *
	 * @public
	 * @method timestamp
	 * @param timestamp {number}
	 * @return {boolean} true if valid
	 */
	isValidTimestamp(timestamp) {
		return (typeof timestamp === 'number' && this.getMomentDate(timestamp).isValid());
	},

	/**
	 * Check to see if an object is a valid moment object
	 *
	 * @public
	 * @method isValidMomentObject
	 * @param date {object}
	 * @return {boolean} true if valid
	 */
	isValidMomentObject(date) {
		return (moment.isMoment(date) && date.isValid());
	},

	/**
	 * Get a monent object from a timestamp that could be seconds or milliseconds
	 *
	 * @public
	 * @method getMomentDate
	 * @param timestamp {number}
	 * @return {moment}
	 */
	getMomentDate(timestamp) {
		if (this.get('isMilliseconds')) {
			return moment.utc(timestamp);
		} else {
			return moment.utc(timestamp*1000);
		}
	},

	/**
	 * observes the timestamp and updates the input values accordingly
	 *
	 * @private
	 * @method updateInputValues
	 */
	updateInputValues: Ember.observer('timestamp', function() {
		const time = this.getMomentDate(this.get('timestamp'));

		this.set('timestampMeridian', time.format('A'));
		this.set('timestampMinutes', time.format('mm'));
		this.set('timestampHours', time.format('hh'));
		this.set('timestampDays', time.format('DD'));
		this.set('timestampMonths', time.format('MM'));
		this.set('timestampYears', time.format('YYYY'));
	}),

	/**
	 * observes the destroyElements value shared with combined picker and destroys both dialogs if set to true
	 *
	 * @private
	 * @method updateInputValues
	 */
	destroyOnChange: Ember.observer('destroyElements', function() {
		if (this.get('destroyElements')) {
			this.set('showDialog', false);
		}
	}),

	/**
	 * receives a moment object and sets it to timestamp
	 *
	 * @private
	 * @method setTimestamp
	 * @param moment {object} moment object
	 */
	setTimestamp(date) {
		if (this.get('isMilliseconds')) {
			this.set('timestamp', date.valueOf());
		} else {
			this.set('timestamp', date.unix());
		}
	},

	/**
	 * only allows up and down arrows and tabs to be affected
	 *
	 * @private
	 * @method onlyAllowArrows
	 * @param {event} key press event
	 */
	onlyAllowArrows(event) {
		const key = event.keyCode || event.which;
		if (key === 13) {
			this.set('showDialog', false);
		}

		// only allows arrow keys and tab key
		if (key === 37 || key === 38 || key === 39 || key === 40 || key === 9) {
			return true;
		} else {
			event.returnValue = false;
			if(event.preventDefault) {
				event.preventDefault();
			}
		}
	},

	/**
	 * removes display none from the dialog containers
	 *
	 * @private
	 * @method addContainer
	 */
	addContainer() {
		Ember.$('.bottom-dialog-container').removeClass('removeDisplay');
		Ember.$('.top-dialog-container').removeClass('removeDisplay');
	},

	actions: {

		/**
		 * figures out if the dialog should go above or below the input and changes updateActive so combined-picker can make the correct changes
		 *
		 * @param active {string} string of which input field was selected
		 * @event focusInput
		 */
		focusInput(active) {
			const activeState = this.get('updateActive');
			const documentHeight = Ember.$(document).height();
			const dialogHeight = this.$().find('.dialog-container').height() + 50;
			const elementHeight = this.$().height();
			const distanceTop = this.$().offset().top;
			const distanceBottom = documentHeight - (distanceTop + elementHeight);

			if (distanceTop > distanceBottom && distanceBottom < dialogHeight) {
				this.set('showDialogTop', true);
				this.set('updateActive', !activeState);
			} else {
				this.set('showDialogTop', false);
				this.set('updateActive',	!activeState);
			}

			this.set('showDialog', true);
			this.set('destroyElements', false);
			this.set('activeSection', active);
			this.addContainer();

			return false;
		},

		/**
		 * focus event handle to set the focus correctly
		 * when the hours and minutes are selected from the time picker
		 *
		 * @event focusOnInput
		 */
		focusOnInput(type) {
			Assert.isString(type);
			type = Ember.String.singularize(type);
			this.$(`.section.${type} > input`).focus();
		},

		closeAction() {
			this.set('showDialog', false);
		},

		/**
		 * handles up and down arrows pressed while in the minutes input fields
		 *
		 * @event keyUpDownHours
		 */
		keyUpDownMinutes() {
			this.onlyAllowArrows(event);

			const code = event.keyCode || event.which;
			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

			let date;

			// 38 -> up arrow being pressed, 39 -> right arrow being pressed
			if (code === 38 || code === 39) {

				// if adding one minute to current date makes minutes >= 60, subtract 59 instead. Otherwise just add 1 minute.
				if (time.minutes() + 1 >= 60) {
					date = time.subtract(59, 'minutes');

					// make sure new time is not before minDate
					if (!date.isBefore(minDate)) {
						this.setTimestamp(date);
					}
				} else {
					date = time.add(1, 'minutes');

					// make sure new time is not after maxDate
					if (!date.isAfter(maxDate)) {
						this.setTimestamp(date);
					}
				}
			// 40 -> down arrow being pressed, 37 -> left arrow being pressed
			} else if (code === 37 || code === 40) {

				// if subtracting one minute to current date makes minutes < 0, add 59 instead. Otherwise just subtract 1 minute.
				if (time.minutes() - 1 < 0) {
					date = time.add(59, 'minutes');

					// make sure new time is not after maxDate
					if (!date.isAfter(maxDate)) {
						this.setTimestamp(date);
					}
				} else {
					date = time.subtract(1, 'minutes');

					// make sure new time is not before minDate
					if (!date.isBefore(minDate)) {
							this.setTimestamp(date);
					}
				}
			}
		},

		/**
		 * handles up and down arrows pressed while in the hours input fields
		 *
		 * @event keyUpDownHours
		 */
		keyUpDownHours() {
			this.onlyAllowArrows(event);

			const code = event.keyCode || event.which;
			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

			let date;

			// 38 -> up arrow being pressed, 39 -> right arrow being pressed
			if (code === 38 || code === 39) {

				// if adding one hour to current date makes hours === 0, subtract 11 instead. Otherwise just add 1 hour.
				if (((time.hour() + 1) % 12) === 0) {
					date = time.subtract(11, 'hours');

					// make sure new time is not before minDate
					if (!date.isBefore(minDate)) {
						this.setTimestamp(date);
					}
				} else {
					date = time.add(1, 'hours');

					// make sure new time is not after maxDate
					if (!date.isAfter(maxDate)) {
						this.setTimestamp(date);
					}
				}
			}
			// 40 -> down arrow being pressed, 37 -> left arrow being pressed
			else if (code ===37 || code === 40) {

				// if current hour is 0 (12), add 11 instead. Otherwise just subtract 1 hour.
				if ((time.hour() % 12) === 0) {
					date = time.add(11, 'hours');

					// make sure new time is not after maxDate
					if (!date.isAfter(maxDate)) {
						this.setTimestamp(date);
					}
				} else {
					date = time.subtract(1, 'hours');

					// make sure new time is not before minDate
					if (!date.isBefore(minDate)) {
						this.setTimestamp(date);
					}
				}
			}
		},

		/**
		 * handles up and down arrows pressed while in the days, months, or years input fields
		 *
		 * @param {string} 'days', 'years,', or 'months'
		 * @event keyUpDownHandler
		 */
		keyUpDownHandler(period) {
			// make sure key has gone up before re triggering changes
			if (this.get('keyHasGoneUp') === true) {
				this.onlyAllowArrows(event);

				const code = event.keyCode || event.which;
				const time = this.getMomentDate(this.get('timestamp'));
				const minDate = this.getMomentDate(this.get('minDate'));
				const maxDate = this.getMomentDate(this.get('maxDate'));

				let date;

				// 38 -> up arrow being pressed, 39 -> right arrow being pressed
				if (code === 38 || code === 39) {
					date = time.add(1, period);

					// make sure new time is not after maxDate
					if (!date.isAfter(maxDate)) {
						this.setTimestamp(date);
					}
				}
				// 40 -> down arrow being pressed, 37 -> left arrow being pressed
				else if (code === 37 || code === 40) {
					date = time.subtract(1, period);

					// make sure new time is not before minDate
					if (!date.isBefore(minDate)) {
						this.setTimestamp(date);
					}
				}

				this.set('keyHasGoneUp', false);
			}
		},

		/**
		 * allows keyup/keydown handlers to work for calendar inputs
		 *
		 * @event resetKeyUp
		 */
		resetKeyUp() {
			this.set('keyHasGoneUp', true);
		},

		/**
		 * handles up and down arrows pressed while in the meridian input fields
		 *
		 * @event meridianKeyHandler
		 */
		meridianKeyHandler() {
			this.onlyAllowArrows(event);

			const code = event.keyCode || event.which;
			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

			let date;

			// 40 -> down arrow being pressed, 37 -> left arrow being pressed
			// 38 -> up arrow being pressed, 39 -> right arrow being pressed
			if (code === 37 || code === 38 || code === 39 || code === 40) {

				// if meridian is am, add 12 hours, else subtract 12 hours
				if (time.format('A') === 'AM') {
					date = time.add(12, 'hours');

					if (!date.isAfter(maxDate)) {
						this.setTimestamp(date);
					}
				} else {
					date = time.subtract(12, 'hours');

					if (!date.isBefore(minDate)) {
						this.setTimestamp(date);
					}
				}
			// is tab is hit on last input, remove dialog
			} else if (code === 9) {
				this.set('closeOnTab', true);
			}
		}
	}
});
