/**
 * @module Components
 *
 */
import $ from 'jquery';
import Component from '@ember/component';
import { observer, get, getWithDefault, set } from '@ember/object';
import { isNone, isEmpty } from '@ember/utils';
import keyEvents from '@busy-web/ember-date-time/mixins/key-events';
import _state from '@busy-web/ember-date-time/utils/state';
import _time from '@busy-web/ember-date-time/utils/time';
import { splitFormat, longFormatDate } from '@busy-web/ember-date-time/utils/format';
import layout from '../templates/components/ember-date-time-picker';
import {
	MONTH_FLAG,
	DAY_FLAG,
	HOUR_FLAG
} from '@busy-web/ember-date-time/utils/constant';

//import stateManager from '../--private/state';

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

	format: 'MM/DD/YYYY hh:mm A', //'L LT',

	/**
	 * value thats used to only allow one action to be sent each keyup/heydown for calendar
	 *
	 * @private
	 * @property keyHasGoneUp
	 * @type Boolean
	 */
	keyHasGoneUp: true,

	/**
	 * The stateManager object used by busy-web-date-time-picker
	 *
	 * @private
	 * @property stateManager
	 * @type object
	 */
	stateManager: null,

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
	init(...args) {
		this._super(...args);
		this.initialize(...args);
	},

	initialize() {
		/**
		 * TODO:
		 * replace stateManager with more advanced state manager
		 * capable of passing events around to all listeners
		 *
		 *
		const __state = stateManager();
		__state.setup({
			timestamp: get(this, 'timestamp'),
			unix: get(this, 'unix'),
			minDate: get(this, 'minDate'),
			maxDate: get(this, 'maxDate'),
			utc: get(this, 'utc'),
			format: get(this, 'format'),
			round: get(this, 'round'),
			roundSelect: get(this, 'roundSelect')
		});

		set(this, '__state', __state);
		__state.update({ active: HOUR_FLAG });
		*/

		// get locale converted format str
		let format = get(this, 'format');
		format = longFormatDate(format);
		setPrivate(this, 'format', format);

		// set timestamp and min max dates
		this.setupTime();

		// set initial focus state
		let index = findSectionIndex(this, HOUR_FLAG);
		set(this, '__defaultFocus', index);

		this.setActiveState();
		this.setupPicker();
		this.setState();
	},

	setupTime() {
		let timestamp = get(this, 'timestamp');
		let unix = get(this, 'unix');
		let minDate = get(this, 'minDate');
		let maxDate = get(this, 'maxDate');

		if (timestamp !== get(this, '__lastTimestamp') || unix !== get(this, '__lastUnix') || minDate !== get(this, '__lastMinDate') || maxDate !== get(this, '__lastMaxDate')) {
			set(this, '__lastTimestamp', timestamp);
			set(this, '__lastUnix', unix);
			set(this, '__lastMinDate', minDate);
			set(this, '__lastMaxDate', maxDate);

			let time, min, max
			if (!isNone(unix)) {
				// assume all dates are unix and convert them to milliseconds
				time = _time.unix(unix).timestamp()
				if (!isNone(minDate)) { min = _time.unix(minDate).timestamp(); }
				if (!isNone(maxDate)) { max = _time.unix(maxDate).timestamp(); }

				if (get(this, 'utc')) {
					time = _time.utcToLocal(time).timestamp();
					if (!isNone(minDate)) { min = _time.utcToLocal(min).timestamp(); }
					if (!isNone(maxDate)) { max = _time.utcToLocal(max).timestamp(); }
				}
			} else if (!isNone(timestamp)) {
				if (get(this, 'utc')) {
					time = _time.utcToLocal(timestamp).timestamp();
					if (!isNone(minDate)) { min = _time.utcToLocal(minDate).timestamp(); }
					if (!isNone(maxDate)) { max = _time.utcToLocal(maxDate).timestamp(); }
				}
			}

			setPrivate(this, 'timestamp', time);
			setPrivate(this, 'calendar', time);
			setPrivate(this, 'min', min);
			setPrivate(this, 'max', max);
		}
	},

	changeAttrs: observer('timestamp', 'unix', 'minDate', 'maxDate', function() {
		this.setupTime();
		this.setState();
	}),

	setState() {
		let timestamp = getPrivate(this, 'timestamp');
		let calendarDate = getPrivate(this, 'calendar');
		let minDate = getPrivate(this, 'min');
		let maxDate = getPrivate(this, 'max');
		let format = getPrivate(this, 'format');
		let selectRound = getWithDefault(this, 'round', 1);
		timestamp = _time.round(timestamp, selectRound);

		if (isNone(get(this, 'stateManager'))) {
			set(this, 'stateManager', _state({ timestamp, calendarDate, minDate, maxDate, format, selectRound }));
		} else {
			set(this, 'stateManager.timestamp', timestamp);
			set(this, 'stateManager.calendarDate', calendarDate);
			set(this, 'stateManager.minDate', minDate);
			set(this, 'stateManager.maxDate', maxDate);
			set(this, 'stateManager.format', format);
			set(this, 'stateManager.selectRound', selectRound);
		}
	},

	setupPicker: observer('hideTime', 'hideDate', function() {
		const showDate = (this.get('hideTime') || !this.get('hideDate'));
		const showTime = (this.get('hideDate') || !this.get('hideTime'));
		let section = DAY_FLAG;
		if (!showDate) {
			section = HOUR_FLAG;
		}

		this.setActiveState({ section, showDate, showTime });
	}),

	setActiveState(options={}) {
		if (isNone(get(this, 'stateManager'))) {
			this.setState();
		}

		if (!isEmpty(options.section)) {
			if (get(this, 'stateManager.section') !== options.section) {
				this.set('stateManager.section', options.section);
				this.focusState(options.section);
			}
		} else {
			if (this.get('hideTime') && !this.get('hideDate') && this.get('lockOpen')) {
				this.set('stateManager.section', DAY_FLAG);
				this.focusState(DAY_FLAG);
			} else if (!this.get('hideTime') && this.get('lockOpen')) {
				this.set('stateManager.section', HOUR_FLAG);
				this.focusState(HOUR_FLAG);
			}
		}

		if (!isNone(options.isOpen)) {
			if (!this.get('lockOpen')) {
				this.set('stateManager.isOpen', options.isOpen);
			}
		}

		if (!isNone(options.isTop)) {
			this.set('stateManager.isTop', options.isTop);
		}

		if (!isNone(options.showDate)) {
			this.set('stateManager.showDate', options.showDate);
		}	else if (this.get('hideTime') && !this.get('hideDate') && this.get('lockOpen')) {
			this.set('stateManager.showDate', true);
		}

		if (!isNone(options.showTime)) {
			this.set('stateManager.showTime', options.showTime);
		} else if (!this.get('hideTime') && this.get('lockOpen')) {
			this.set('stateManager.showTime', true);
		}
	},

	focusState(section) {
		let el = this.$(`input`);
		if (el && el.length) {
			let index;
			if (!isEmpty(section)) {
				index = findSectionIndex(this, section);
			} else {
				index = findSectionIndex(this, HOUR_FLAG);
			}

			if (el.data('selection') !== index) {
				el.data('selection', index);
				el.data('forceSelection', true);
				el.focus();
			}
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

		let timestamp;
		if (!isNone(get(this, 'timestamp'))) {
			timestamp = time;
			set(this, '__lastTimestamp', timestamp);
			set(this, 'timestamp', timestamp);
		}

		let unix;
		if (!isNone(get(this, 'unix'))) {
			unix = _time(time).unix();
			set(this, '__lastUnix', unix);
			set(this, 'unix', unix);
		}

		this.setState();
		this.sendAction('onChange', { timestamp, unix });
	},

	updateTime(type, time, calendar) {
		time = _time.round(time, get(this, 'stateManager.selectRound'));
		calendar = _time.round(calendar, get(this, 'stateManager.selectRound'));

		if (type === MONTH_FLAG) {
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
			this.updateTime(DAY_FLAG, time);
		},

		applyChange(evt, time) {
			this.updateTime(DAY_FLAG, time);
			this.send('closeAction');
		},

		update(section, time, calendar) {
			this.updateTime(section, time, calendar);
			this.setActiveState({ section });
			this.focusState(section);
		},

		stateChange(section) {
			if (section === `m-${HOUR_FLAG}`) {
				section = HOUR_FLAG;
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
	if (type === HOUR_FLAG) {
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

