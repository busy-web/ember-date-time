/**
 * @module Components
 *
 */
import Ember from 'ember';
import keyEvents from 'ember-paper-time-picker/mixins/key-events';
import layout from '../templates/components/paper-datetime-picker';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import Assert from 'busy-utils/assert';

/**
 * `Component/paper-datetime-picker`
 *
 * @class PaperDatetimePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend(keyEvents, {
	/**
	 * @private
	 * @property classNames
	 * @type String
	 * @default paper-datetime-picker
	 */
	classNames: ['paper-datetime-picker'],
	layout: layout,

	/**
	 * timestamp that is passed in as a milliseconds timestamp
	 *
	 * @private
	 * @property timestamp
	 * @type Number
	 */
	timestamp: null,

	/**
	 * timestamp that is passed in as a seconds timestamp
	 *
	 * @public
	 * @property unix
	 * @type number
	 */
	unix: null,

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
	 * set to true if the values passed in should not be converted to local time
	 *
	 * @public
	 * @property utc
	 * @type boolean
	 */
	utc: false,

	lastSaveTime: null,

	format: 'MMM DD, YYYY',

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
	 * active state of the picker view this is an object
	 * passed around to the different compnents to trigger state
	 * changes.
	 *
	 * @private
	 * @property activeState
	 * @type string
	 */
	activeState: null,

	/**
	 * value thats used to only allow one action to be sent each keyup/heydown for calendar
	 *
	 * @private
	 * @property keyHasGoneUp
	 * @type Boolean
	 */
	keyHasGoneUp: true,

	/**
	 * The date object used by paper-datetime-picker
	 *
	 * @private
	 * @property paper
	 * @type object
	 */
	paper: null,
	calendar: null,

	hideTime: false,
	hideDate: false,

	/**
	 * checks if timestamp is valid calls updateInputValues
	 *
	 * @private
	 * @method initialize
	 * @constructor
	 */
	initialize: Ember.on('init', function() {
		this.setActiveState();
		this.setupPicker();
		this.setPaperDate(this.get('timestamp'), this.get('unix'));
		this.updateInputValues();
	}),

	setPaperDate: function(timestamp, unix) {
		let minDate = this.get('minDate');
		let maxDate = this.get('maxDate');

		if (this.get('utc')) {
			if (!Ember.isNone(timestamp)) {
				timestamp = TimePicker.utcToLocal(timestamp);
				minDate = TimePicker.utcToLocal(minDate);
				maxDate = TimePicker.utcToLocal(maxDate);
			} else if (!Ember.isNone(unix)) {
				// assume all dates are unix but convert them to milliseconds
				timestamp = TimePicker.utcToLocal(unix*1000);
				minDate = TimePicker.utcToLocal(minDate*1000);
				maxDate = TimePicker.utcToLocal(maxDate*1000);
			}
		}

		const paper = paperDate({
			timestamp: timestamp,
			minDate: this.get('minDate'),
			maxDate: this.get('maxDate'),
			format: this.get('format'),
		});

		this.set('paper', paper);

		const cal = paperDate({
			timestamp: timestamp,
			minDate: this.get('minDate'),
			maxDate: this.get('maxDate'),
			format: this.get('format'),
		});

		this.set('calendar', cal);
	},

	setupPicker: Ember.observer('hideTime', 'hideDate', function() {
		Assert.isBoolean(this.get('hideTime'));
		Assert.isBoolean(this.get('hideDate'));

		const showDate = (this.get('hideTime') || !this.get('hideDate'));
		const showTime = (this.get('hideDate') || !this.get('hideTime'));
		let state = 'day';
		if (!showDate) {
			state = 'hour';
		}

		this.setActiveState({ state, showDate, showTime });
	}),

	/**
	 * observes the timestamp and updates the input values accordingly
	 *
	 * @private
	 * @method updateInputValues
	 */
	updateInputValues: Ember.observer('paper.timestamp', function() {
		const time = this.get('paper.date');

		this.set('timestampMeridian', time.format('A'));
		this.set('timestampMinutes', time.format('mm'));
		this.set('timestampHours', time.format('hh'));
		this.set('timestampDays', time.format('DD'));
		this.set('timestampMonths', time.format('MM'));
		this.set('timestampYears', time.format('YYYY'));
	}),

	/**
	 * receives a moment object and sets it to timestamp
	 *
	 * @private
	 * @method setTimestamp
	 * @param time {Moment|number} moment or timestamp
	 */
	setTimestamp(time) {
		if (!Ember.isNone(time)) {
			if (typeof time === 'object' && typeof time.valueOf === 'function') {
				time = time.valueOf();
			}
			this.set('lastSaveTime', time);

			if (this.get('utc')) {
				time = TimePicker.utcFromLocal(time);
			}

			if (!Ember.isNone(this.get('timestamp'))) {
				this.set('timestamp', time);
			}

			if (!Ember.isNone(this.get('unix'))) {
				time = TimePicker.getUnix(time);
				this.set('unix', time);
			}

			this.setPaperDate(this.get('timestamp'), this.get('unix'));
		}
	},

	setActiveState(options={}) {
		if (Ember.isNone(this.get('activeState'))) {
			const activeState = Ember.Object.create({
				state: '',
				isOpen: false,
				isTop: false,
		 	});
			this.set('activeState', activeState);
		}

		if (!Ember.isNone(options.state)) {

			this.set('activeState.state', options.state);
		}

		if (!Ember.isNone(options.isOpen)) {
			this.set('activeState.isOpen', options.isOpen);
		}

		if (!Ember.isNone(options.isTop)) {
			this.set('activeState.isTop', options.isTop);
		}

		if (!Ember.isNone(options.showDate)) {
			this.set('activeState.showDate', options.showDate);
		}

		if (!Ember.isNone(options.showTime)) {
			this.set('activeState.showTime', options.showTime);
		}
	},

	shouldPickerOpenTop() {
		const documentHeight = Ember.$(document).height();
		const dialogHeight = this.$().find('.dialog-container').height() + 50;
		const elementHeight = this.$().height();
		const distanceTop = this.$().offset().top;
		const distanceBottom = documentHeight - (distanceTop + elementHeight);

		return (distanceTop > distanceBottom && distanceBottom < dialogHeight);
	},

	focusState(state) {
		state = Ember.String.singularize(state);
		this.$(`.section.${state} > input`).focus();
	},

	actions: {

		/**
		 * figures out if the dialog should go above or below the input and changes activeState so combined-picker can make the correct changes
		 *
		 * @param active {string} string of which input field was selected
		 * @event focusInput
		 */
		focusInput(state) {
			if (Ember.isEmpty(state)) {
				state = 'hour';
				if (!this.get('activeState.showTime')) {
					state = 'day';
				}
				this.focusState(state);
			}

			const isOpen = true;
			const isTop = this.shouldPickerOpenTop();
			this.setActiveState({ state, isOpen, isTop });
			return false;
		},

		closeAction() {
			this.setActiveState({ state: '', isOpen: false, isTop: false });
		},

		keyReleased() {
			if (this.get('lastSaveTime') !== this.get('paper.timestamp')) {
				this.setTimestamp(this.get('paper.timestamp'));
			}
		},

		/**
		 * handles up and down arrows pressed while in the minutes input fields
		 *
		 * @event keyUpDownHours
		 */
		keyUpDownMinutes() {
			if(!this.isAllowedKey(event, ['left-arrow', 'up-arrow', 'down-arrow', 'right-arrow', 'tab', 'enter'])) {
				return false;
			}

			// 38 -> up arrow being pressed, 39 -> right arrow being pressed
			this.onKeyPressed(event, ['right-arrow', 'up-arrow'], () => {
				if ((this.get('paper.date').minutes() + 1) > 59) {
					this.get('paper').subtract(59, 'minutes');
				} else {
					this.get('paper').add(1, 'minutes');
				}
			});

			// 40 -> down arrow being pressed, 37 -> left arrow being pressed
			this.onKeyPressed(event, ['left-arrow', 'down-arrow'], () => {
				if ((this.get('paper.date').minutes() - 1) < 0) {
					this.get('paper').add(59, 'minutes');
				} else {
					this.get('paper').subtract(1, 'minutes');
				}
			});

			// enter key will close the picker
			this.onKeyPressed(event, ['enter'], () => {
				this.send('closeAction');
			});
		},

		/**
		 * handles up and down arrows pressed while in the hours input fields
		 *
		 * @event keyUpDownHours
		 */
		keyUpDownHours() {
			if(!this.isAllowedKey(event, ['left-arrow', 'up-arrow', 'down-arrow', 'right-arrow', 'tab', 'enter'])) {
				return false;
			}

			// 38 -> up arrow being pressed, 39 -> right arrow being pressed
			this.onKeyPressed(event, ['right-arrow', 'up-arrow'], () => {
				if (((this.get('paper.date').hour() + 1) % 12) === 0) {
					this.get('paper').subtract(11, 'hours');
				} else {
					this.get('paper').add(1, 'hours');
				}
			});

			// 40 -> down arrow being pressed, 37 -> left arrow being pressed
			this.onKeyPressed(event, ['left-arrow', 'down-arrow'], () => {
				if ((this.get('paper.date').hour() % 12) === 0) {
					this.get('paper').add(11, 'hours');
				} else {
					this.get('paper').subtract(1, 'hours');
				}
			});

			// enter key will close the picker
			this.onKeyPressed(event, ['enter'], () => {
				this.send('closeAction');
			});
		},

		/**
		 * handles up and down arrows pressed while in the days, months, or years input fields
		 *
		 * @param {string} 'days', 'years,', or 'months'
		 * @event keyUpDownHandler
		 */
		keyUpDownHandler(period) {
			if(!this.isAllowedKey(event, ['left-arrow', 'up-arrow', 'down-arrow', 'right-arrow', 'tab', 'enter'])) {
				return false;
			}

			// 38 -> up arrow being pressed, 39 -> right arrow being pressed
			this.onKeyPressed(event, ['right-arrow', 'up-arrow'], () => {
				this.get('paper').add(1, period);
			});

			// 40 -> down arrow being pressed, 37 -> left arrow being pressed
			this.onKeyPressed(event, ['left-arrow', 'down-arrow'], () => {
				this.get('paper').subtract(1, period);
			});

			// enter key will close the picker
			this.onKeyPressed(event, ['enter'], () => {
				this.send('closeAction');
			});

			// enter key will close the picker
			this.onKeyPressed(event, ['tab'], () => {
				if (event.shiftKey) {
					this.send('closeAction');
				}
			});
		},

		/**
		 * handles up and down arrows pressed while in the meridian input fields
		 *
		 * @event meridianKeyHandler
		 */
		meridianKeyHandler() {
			if(!this.isAllowedKey(event, ['left-arrow', 'up-arrow', 'down-arrow', 'right-arrow', 'tab', 'enter'])) {
				return false;
			}

			this.onKeyPressed(event, ['right-arrow', 'up-arrow', 'left-arrow', 'down-arrow'], () => {
				if(this.get('paper.date').format('A') === 'AM') {
					this.get('paper').add(12, 'hours');
				} else {
					this.get('paper').subtract(12, 'hours');
				}
			});

			// enter key will close the picker
			this.onKeyPressed(event, ['enter'], () => {
				this.send('closeAction');
			});

			// enter key will close the picker
			this.onKeyPressed(event, ['tab'], () => {
				if (!event.shiftKey) {
					this.send('closeAction');
				}
			});
		},

		update(state, timestamp) {
			this.focusState(state);
			this.setTimestamp(timestamp);
		},
	}
});
