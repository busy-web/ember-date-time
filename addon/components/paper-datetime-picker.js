/**
 * @module Components
 *
 */
import $ from 'jquery';
import Component from '@ember/component';
import EmberObject, { observer, get } from '@ember/object';
import { isNone, isEmpty } from '@ember/utils';
import { on } from '@ember/object/evented';
import keyEvents from 'ember-paper-time-picker/mixins/key-events';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import layout from '../templates/components/paper-datetime-picker';

/**
 * `Component/paper-datetime-picker`
 *
 * @class PaperDatetimePicker
 * @namespace Components
 * @extends Component
 */
export default Component.extend(keyEvents, {
	/**
	 * @private
	 * @property classNames
	 * @type String
	 * @default paper-datetime-picker
	 */
	classNames: ['paper-datetime-picker'],
	layout,

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

	lockOpen: false,

	/**
	 * checks if timestamp is valid calls updateInputValues
	 *
	 * @private
	 * @method initialize
	 * @constructor
	 */
	initialize: on('init', function() {
		this.setActiveState();
		this.setupPicker();
		this.setPaperDate(this.get('timestamp'), this.get('unix'));
		this.updateInputValues();
	}),

	setPaperDate: function(timestamp, unix) {
		let minDate = this.get('minDate');
		let maxDate = this.get('maxDate');

		if (!isNone(timestamp)) {
			if (this.get('utc')) {
				timestamp = TimePicker.utcToLocal(timestamp);
				if (!isNone(minDate)) { minDate = TimePicker.utcToLocal(minDate); }
				if (!isNone(maxDate)) { maxDate = TimePicker.utcToLocal(maxDate); }
			}
		} else if (!isNone(unix)) {
			// assume all dates are unix and convert them to milliseconds
			timestamp = TimePicker.getTimstamp(unix);
			if (!isNone(minDate)) { minDate = TimePicker.getTimstamp(minDate); }
			if (!isNone(maxDate)) { maxDate = TimePicker.getTimstamp(maxDate); }

			if (this.get('utc')) {
				timestamp = TimePicker.utcToLocal(timestamp);
				if (!isNone(minDate)) { minDate = TimePicker.utcToLocal(minDate); }
				if (!isNone(maxDate)) { maxDate = TimePicker.utcToLocal(maxDate); }
			}
		}

		const paper = paperDate({
			timestamp: timestamp,
			minDate: minDate,
			maxDate: maxDate,
			format: this.get('format'),
		});

		this.set('paper', paper);

		const cal = paperDate({
			timestamp: timestamp,
			minDate: minDate,
			maxDate: maxDate,
			format: this.get('format'),
		});

		this.set('calendar', cal);
	},

	setupPicker: observer('hideTime', 'hideDate', function() {
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
	updateInputValues: observer('paper.timestamp', function() {
		const time = this.get('paper.date');

		this.set('timestampMeridian', time.format('A'));
		this.set('timestampMinutes', time.format('mm'));
		this.set('timestampHours', time.format('hh'));
		this.set('timestampDays', time.format('DD'));
		this.set('timestampMonths', time.format('MM'));
		this.set('timestampYears', time.format('YYYY'));
	}),

	/**
	 * observes the timestamp/unix and updates paper values if they are changed outside of time picker
	 *
	 * @private
	 * @method updatePaperOnTimestampChange
	 */
	updatePaperOnTimestampChange: observer('timestamp', 'unix', function() {
		this.setPaperDate(this.get('timestamp'), this.get('unix'));
	}),

	/**
	 * receives a moment object and sets it to timestamp
	 *
	 * @private
	 * @method setTimestamp
	 * @param time {Moment|number} moment or timestamp
	 */
	setTimestamp(time) {
		if (!isNone(time)) {
			if (typeof time === 'object' && typeof time.valueOf === 'function') {
				time = time.valueOf();
			}
			this.set('lastSaveTime', time);

			if (this.get('utc')) {
				time = TimePicker.utcFromLocal(time);
			}

			if (!isNone(this.get('timestamp'))) {
				this.set('timestamp', time);
			}

			if (!isNone(this.get('unix'))) {
				time = TimePicker.getUnix(time);
				this.set('unix', time);
			}

			this.setPaperDate(this.get('timestamp'), this.get('unix'));
		}
	},

	setActiveState(options={}) {
		if (isNone(this.get('activeState'))) {
			this.set('activeState', EmberObject.create({
				state: '',
				isOpen: this.get('lockOpen') ? true : false,
				isTop: false,
			}));
		}

		if (!isEmpty(options.state)) {
			this.set('activeState.state', options.state);
		} else {
			if (this.get('hideTime') && !this.get('hideDate') && this.get('lockOpen')) {
				this.set('activeState.state', 'day');
			} else if (!this.get('hideTime') && this.get('lockOpen')) {
				this.set('activeState.state', 'hour');
			}
		}

		if (!isNone(options.isOpen)) {
			if (!this.get('lockOpen')) {
				this.set('activeState.isOpen', options.isOpen);
			}
		}

		if (!isNone(options.isTop)) {
			this.set('activeState.isTop', options.isTop);
		}

		if (!isNone(options.showDate)) {
			this.set('activeState.showDate', options.showDate);
		}	else if (this.get('hideTime') && !this.get('hideDate') && this.get('lockOpen')) {
			this.set('activeState.showDate', true);
		}

		if (!isNone(options.showTime)) {
			this.set('activeState.showTime', options.showTime);
		} else if (!this.get('hideTime') && this.get('lockOpen')) {
			this.set('activeState.showTime', true);
		}
	},

	shouldPickerOpenTop() {
		const documentHeight = $(document).height();
		const dialogHeight = this.$().find('.dialog-container').height() + 50;
		const elementHeight = this.$().height();
		const distanceTop = this.$().offset().top;
		const distanceBottom = documentHeight - (distanceTop + elementHeight);

		return (distanceTop > distanceBottom && distanceBottom < dialogHeight);
	},

	focusState() {
		let state = this.get('activeState.state');
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
			let focus = false;
			if (isEmpty(state)) {
				state = 'hour';
				if (!this.get('activeState.showTime')) {
					state = 'day';
				}
				focus = true;
			}

			const isOpen = true;
			const isTop = this.shouldPickerOpenTop();
			this.setActiveState({ state, isOpen, isTop });
			if (focus) {
				this.focusState();
			}
			this.sendAction('onFocus', get(this, 'activeState'));
			return false;
		},

		closeAction() {
			if (!this.get('lockOpen')) {
				this.setActiveState({ state: '', isOpen: false, isTop: false });
			}
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
			if (!this.throttleKey(event)) {
				return false;
			}

			if (!this.isAllowedKey(event, ['left-arrow', 'up-arrow', 'down-arrow', 'right-arrow', 'tab', 'enter'])) {
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
			if (!this.throttleKey(event)) {
				return false;
			}

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
			if (!this.throttleKey(event)) {
				return false;
			}

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
			if (!this.throttleKey(event)) {
				return false;
			}

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

		change(state, timestamp) {
			this.sendAction('onChange', state, timestamp);
		},

		update(state, timestamp) {
			console.log('state before', state);
			state = state.replace(/s$/, '');
			console.log('state after', state);
			this.setActiveState({ state });
			this.focusState();
			this.setTimestamp(timestamp);
			this.sendAction('onUpdate', state, timestamp);
		}
	}
});
