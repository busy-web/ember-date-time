/**
 * @module Components
 *
 */
import $ from 'jquery';
import Component from '@ember/component';
import EmberObject, { observer, get, set } from '@ember/object';
import { isNone, isEmpty } from '@ember/utils';
import { on } from '@ember/object/evented';
import keyEvents from 'ember-paper-time-picker/mixins/key-events';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import paperTime from 'ember-paper-time-picker/utils/paper-time';
import { splitFormat, longFormatDate } from 'ember-paper-time-picker/utils/date-format-parser';
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

	format: 'L LT',

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

	hideTime: false,
	hideDate: false,
	lockOpen: false,

	__timestamp: null,
	__calendar: null,
	__min: null,
	__max: null,

	/**
	 * checks if timestamp is valid calls updateInputValues
	 *
	 * @private
	 * @method initialize
	 * @constructor
	 */
	initialize: on('willInsertElement', function() {
		// get locale converted format str
		let format = get(this, 'format');
		format = longFormatDate(format);
		setPrivate(this, 'format', format);

		let timestamp = get(this, 'timestamp');
		let unix = get(this, 'unix');
		let minDate = get(this, 'minDate');
		let maxDate = get(this, 'maxDate');

		if (!isNone(timestamp)) {
			if (get(this, 'utc')) {
				timestamp = TimePicker.utcToLocal(timestamp);
				if (!isNone(minDate)) { minDate = TimePicker.utcToLocal(minDate); }
				if (!isNone(maxDate)) { maxDate = TimePicker.utcToLocal(maxDate); }
			}
		} else if (!isNone(unix)) {
			// assume all dates are unix and convert them to milliseconds
			timestamp = TimePicker.getTimstamp(unix);
			if (!isNone(minDate)) { minDate = TimePicker.getTimstamp(minDate); }
			if (!isNone(maxDate)) { maxDate = TimePicker.getTimstamp(maxDate); }

			if (get(this, 'utc')) {
				timestamp = TimePicker.utcToLocal(timestamp);
				if (!isNone(minDate)) { minDate = TimePicker.utcToLocal(minDate); }
				if (!isNone(maxDate)) { maxDate = TimePicker.utcToLocal(maxDate); }
			}
		}

		setPrivate(this, 'timestamp', timestamp);
		setPrivate(this, 'calendar', timestamp);
		setPrivate(this, 'min', minDate);
		setPrivate(this, 'max', maxDate);

		this.setActiveState();
		this.setupPicker();
		this.setPaper();
	}),

	setPaper() {
		let timestamp = getPrivate(this, 'timestamp');
		let calendarDate = getPrivate(this, 'calendar');
		let minDate = getPrivate(this, 'min');
		let maxDate = getPrivate(this, 'max');
		let format = getPrivate(this, 'format');

		set(this, 'paper', paperDate({ timestamp, calendarDate, minDate, maxDate, format }));
	},

	setupPicker: observer('hideTime', 'hideDate', function() {
		const showDate = (this.get('hideTime') || !this.get('hideDate'));
		const showTime = (this.get('hideDate') || !this.get('hideTime'));
		let state = 'days';
		if (!showDate) {
			state = 'hours';
		}

		this.setActiveState({ state, showDate, showTime });
	}),

	setActiveState(options={}) {
		if (isNone(this.get('activeState'))) {
			this.set('activeState', EmberObject.create({
				state: '',
				isOpen: this.get('lockOpen') ? true : false,
				isTop: false,
			}));
		}

		if (!isEmpty(options.state)) {
			if (get(this, 'activeState.state') !== options.state) {
				this.set('activeState.state', options.state);
				this.focusState(options.state);
			}
		} else {
			if (this.get('hideTime') && !this.get('hideDate') && this.get('lockOpen')) {
				this.set('activeState.state', 'days');
				this.focusState('days');
			} else if (!this.get('hideTime') && this.get('lockOpen')) {
				this.set('activeState.state', 'hours');
				this.focusState('hours');
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

	focusState(state) {
		let el = this.$(`input`);
		let index;
		if (!isEmpty(state)) {
			index = findSectionIndex(this, state);
		} else {
			index = findSectionIndex(this, 'hours');
		}
		el.data('selection', index);
		el.focus();
	},

	shouldPickerOpenTop() {
		const documentHeight = $(document).height();
		const dialogHeight = this.$().find('.dialog-container').height() + 50;
		const elementHeight = this.$().height();
		const distanceTop = this.$().offset().top;
		const distanceBottom = documentHeight - (distanceTop + elementHeight);

		return (distanceTop > distanceBottom && distanceBottom < dialogHeight);
	},

	/**
	 * triggeres a date change event to send off
	 * to listeners of `onChange`
	 *
	 * @public
	 * @method triggerDateChange
	 */
	triggerDateChange() {
		let time = getPrivate(this, 'timestamp');
		if (get(this, 'utc')) {
			time = paperTime.utcFromLocal(time);
		}

		let unix = paperTime(time).unix();
		set(this, 'timestamp', time);
		set(this, 'unix', unix);

		this.setPaper();
		this.sendAction('onChange', time, unix);
	},

	updateTime(type, time, calendar) {
		if (type === 'months') {
			if (!isNone(calendar)) {
				setPrivate(this, 'calendar', calendar);
				this.setPaper();
			}
		} else {
			setPrivate(this, 'timestamp', time);
			setPrivate(this, 'calendar', time);
			this.triggerDateChange();
		}
	},

	actions: {
		dateChange(time) {
			this.updateTime('days', time);
		},

		applyChange(time) {
			this.updateTime('days', time);
			this.send('closeAction');
		},

		update(state, time, calendar) {
			this.updateTime(state, time, calendar);
			this.setActiveState({ state });
		},

		stateChange(state) {
			const isOpen = true;
			const isTop = this.shouldPickerOpenTop();
			this.setActiveState({ state, isOpen, isTop });
		},

		closeAction() {
			if (!this.get('lockOpen')) {
				this.setActiveState({ state: '', isOpen: false, isTop: false });
			}
		}
	}
});

function getPrivate(target, name) {
	return get(target, `__${name}`);
}

function setPrivate(target, name, value) {
	set(target, `__${name}`, value);
}

function findSectionIndex(target, type) {
	let format = getPrivate(target, 'format');
	let value = paperTime(getPrivate(target, 'timestamp')).format(format);
	let f = splitFormat(format);
	let v = splitFormat(value);

	let exp;
	if (type === 'hours') {
		exp = paperTime.typeExp(`m-${type}`);
		if (!exp.test(format)) {
			exp = paperTime.typeExp(type);
		}
	} else {
		exp = paperTime.typeExp(type);
	}

	let done = false;
	let length = 0;
	f.forEach((sec, idx) => {
		if (exp.test(sec)) {
			done = true;
		}

		if (!done) {
			length = length + v[idx].length + 1;
		}
	});
	return length;
}

