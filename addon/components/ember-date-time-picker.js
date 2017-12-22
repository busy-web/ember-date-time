/**
 * @module Components
 *
 */
import $ from 'jquery';
import Component from '@ember/component';
import { observer, get, getWithDefault, set } from '@ember/object';
import { isNone, isEmpty } from '@ember/utils';
import { on } from '@ember/object/evented';
import keyEvents from '@busy-web/ember-date-time/mixins/key-events';
import _state from '@busy-web/ember-date-time/utils/state';
import _time from '@busy-web/ember-date-time/utils/time';
import { splitFormat, longFormatDate } from '@busy-web/ember-date-time/utils/format';
import layout from '../templates/components/ember-date-time-picker';

/**
 * `Component/Busyweb/EmberDateTimePicker`
 *
 * @class DateTimePicker
 * @namespace Components
 * @extends Component
 */
export default Component.extend(keyEvents, {
	/**
	 * @private
	 * @property classNames
	 * @type String
	 * @default busy-web-date-time-picker
	 */
	classNames: ['busyweb', 'emberdatetime', 'c-date-time-picker'],
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
	 * value thats used to only allow one action to be sent each keyup/heydown for calendar
	 *
	 * @private
	 * @property keyHasGoneUp
	 * @type Boolean
	 */
	keyHasGoneUp: true,

	/**
	 * The activeState object used by busy-web-date-time-picker
	 *
	 * @private
	 * @property activeState
	 * @type object
	 */
	activeState: null,

	/**
	 * Round the minutes by this amount of minutes.
	 * Must be one of the following 1, 5, 10, 15, 30
	 *
	 * @property round
	 * @type {number}
	 */
	round: 1,

	hideTime: false,
	hideDate: false,
	lockOpen: false,

	__timestamp: null,
	__calendar: null,
	__min: null,
	__max: null,
	__defaultFocus: 0,

	/**
	 * checks if timestamp is valid calls updateInputValues
	 *
	 * @private
	 * @method initialize
	 * @constructor
	 */
	initialize: on('init', function() {
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
				timestamp = _time.utcToLocal(timestamp).timestamp();
				if (!isNone(minDate)) { minDate = _time.utcToLocal(minDate).timestamp(); }
				if (!isNone(maxDate)) { maxDate = _time.utcToLocal(maxDate).timestamp(); }
			}
		} else if (!isNone(unix)) {
			// assume all dates are unix and convert them to milliseconds
			timestamp = _time.unix(unix).timestamp()
			if (!isNone(minDate)) { minDate = _time.unix(minDate).timestamp(); }
			if (!isNone(maxDate)) { maxDate = _time.unix(maxDate).timestamp(); }

			if (get(this, 'utc')) {
				timestamp = _time.utcToLocal(timestamp).timestamp();
				if (!isNone(minDate)) { minDate = _time.utcToLocal(minDate).timestamp(); }
				if (!isNone(maxDate)) { maxDate = _time.utcToLocal(maxDate).timestamp(); }
			}
		}

		let selectRound = getWithDefault(this, 'selectRound', 1);
		timestamp = _time.round(timestamp, selectRound);

		setPrivate(this, 'timestamp', timestamp);
		setPrivate(this, 'calendar', timestamp);
		setPrivate(this, 'min', minDate);
		setPrivate(this, 'max', maxDate);

		// set initial focus state
		let index = findSectionIndex(this, 'hours');
		set(this, '__defaultFocus', index);

		this.setActiveState();
		this.setupPicker();
		this.setState();
	}),

	setState() {
		let timestamp = getPrivate(this, 'timestamp');
		let calendarDate = getPrivate(this, 'calendar');
		let minDate = getPrivate(this, 'min');
		let maxDate = getPrivate(this, 'max');
		let format = getPrivate(this, 'format');

		if (isNone(get(this, 'activeState'))) {
			let round = get(this, 'round');
			let selectRound = getWithDefault(this, 'selectRound', 1);

			timestamp = _time.round(timestamp, selectRound);
			set(this, 'activeState', _state({ timestamp, calendarDate, minDate, maxDate, format, round, selectRound }));
		} else {
			set(this, 'activeState.timestamp', timestamp);
			set(this, 'activeState.calendarDate', calendarDate);
			set(this, 'activeState.minDate', minDate);
			set(this, 'activeState.maxDate', maxDate);
			set(this, 'format', format);
		}
	},

	setupPicker: observer('hideTime', 'hideDate', function() {
		const showDate = (this.get('hideTime') || !this.get('hideDate'));
		const showTime = (this.get('hideDate') || !this.get('hideTime'));
		let section = 'days';
		if (!showDate) {
			section = 'hours';
		}

		this.setActiveState({ section, showDate, showTime });
	}),

	setActiveState(options={}) {
		if (isNone(get(this, 'activeState'))) {
			this.setState();
		}

		if (!isEmpty(options.section)) {
			if (get(this, 'activeState.section') !== options.section) {
				this.set('activeState.section', options.section);
				this.focusState(options.section);
			}
		} else {
			if (this.get('hideTime') && !this.get('hideDate') && this.get('lockOpen')) {
				this.set('activeState.section', 'days');
				this.focusState('days');
			} else if (!this.get('hideTime') && this.get('lockOpen')) {
				this.set('activeState.section', 'hours');
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

	focusState(section) {
		let el = this.$(`input`);
		if (el && el.length) {
			let index;
			if (!isEmpty(section)) {
				index = findSectionIndex(this, section);
			} else {
				index = findSectionIndex(this, 'hours');
			}
			el.data('selection', index);
			el.focus();
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
			time = _time.utcFromLocal(time).timestamp();
		}

		let unix = _time(time).unix();
		set(this, 'timestamp', time);
		set(this, 'unix', unix);

		this.setState();
		this.sendAction('onChange', time, unix);
	},

	updateTime(type, time, calendar) {
		time = _time.round(time, getWithDefault(this, 'selectRound', 1));
		calendar = _time.round(calendar, getWithDefault(this, 'selectRound', 1));

		if (type === 'months') {
			if (!isNone(calendar)) {
				setPrivate(this, 'calendar', calendar);
				this.setState();
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

		update(section, time, calendar) {
			this.updateTime(section, time, calendar);
			this.setActiveState({ section });
			this.focusState(section);
		},

		stateChange(section) {
			if (section === 'm-hours') {
				section = 'hours';
			}
			const isOpen = true;
			const isTop = this.shouldPickerOpenTop();
			this.setActiveState({ section, isOpen, isTop });
		},

		closeAction() {
			if (!this.get('lockOpen')) {
				this.setActiveState({ section: '', isOpen: false, isTop: false });
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
	let value = _time(getPrivate(target, 'timestamp')).format(format);
	let f = splitFormat(format);
	let v = splitFormat(value);

	let exp;
	if (type === 'hours') {
		exp = _time.typeExp(`m-${type}`);
		if (!exp.test(format)) {
			exp = _time.typeExp(type);
		}
	} else {
		exp = _time.typeExp(type);
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

