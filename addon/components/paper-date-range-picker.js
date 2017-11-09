/**
 * @module Components
 *
 */
import Component from '@ember/component';
import EmberObject, { set, get, computed } from '@ember/object';
import { later } from '@ember/runloop';
import { underscore } from '@ember/string';
import { on } from '@ember/object/evented';
import { isEmpty, isNone } from '@ember/utils';
import { loc } from '@ember/string';
import { assert } from '@ember/debug';
import layout from '../templates/components/paper-date-range-picker';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import paperDate from 'ember-paper-time-picker/utils/paper-date';

export default Component.extend({
	/**
	 * @private
	 * @property classNames
	 * @type String
	 * @default paper-datetime-picker
	 */
	classNames: ['paper-date-range-picker'],
	classNameBindings: ['large', 'right'],
	layout,

	large: false,
	right: false,

	/**
	 * timestamp that is passed in as a milliseconds timestamp
	 *
	 * @private
	 * @property timestamp
	 * @type Number
	 */
	startTime: null,
	endTime: null,

	/**
	 * timestamp that is passed in as a seconds timestamp
	 *
	 * @public
	 * @property unix
	 * @type number
	 */
	startUnix: null,
	endUnix: null,

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

	format: 'MMM DD, YYYY',

	_start: null,
	_end: null,
	_min: null,
	_max: null,

	hideTime: true,
	hideDate: false,

	defaultAction: '',

	paper: null,
	calendar: null,

	activeState: null,

	isStart: true,

	isListOpen: false,
	isCustom: false,
	activeDates: null,

	disableNext: computed('selected', '_start', '_max', function() {
		const { start } = this.getInterval(1);
		return get(this, '_max') < start;
	}),

	disablePrev: computed('selected', '_end', '_min', function() {
		const { end } = this.getInterval(-1);
		return get(this, '_min') > end;
	}),

	selectedDateRange: computed('selected', '_start', '_end', function() {
		const { id } = get(this, 'selected');
		const start = TimePicker.getMomentDate(this.getStart());
		const end = TimePicker.getMomentDate(this.getEnd());
		if (start.year() !== end.year()) {
			return start.format('MMM. Do, YYYY') + ' - ' + end.format('MMM. Do, YYYY');
		} else if (start.month() !== end.month()) {
			return start.format('MMM. Do') + ' - ' + end.format('MMM. Do, YYYY');
		} else {
			if (id === 'monthly') {
				return start.format('MMMM YYYY');
			} else if (start.date() === end.date()) {
				return start.format('MMM. Do, YYYY');
			} else {
				return start.format('MMM. Do') + ' - ' + end.format('Do, YYYY');
			}
		}
	}),

	getAttr(key) {
		const attrs = get(this, 'attrs');
		if (!isNone(get(attrs, key))) {
			return get(this, key);
		}
		return null;
	},

	setup: on('didReceiveAttrs', function() {
		const utc = get(this, 'utc');
		const isUnix = !isNone(get(this, 'startUnix')) || !isNone(get(this, 'endUnix'));
		set(this, '_isUnix', isUnix);

		if (isNone(get(this, 'activeDates'))) {
			set(this, 'activeDates', []);
		}

		if (!get(this, 'changeFired') && (!isNone(this.getAttr('startTime')) || !isNone(this.getAttr('startUnix')))) {
			let time = this.getAttr('startTime') || TimePicker.getTimstamp(this.getAttr('startUnix'));
			if (utc) {
				time = TimePicker.utcToLocal(time);
			}
			this.setStart(time);
		} else if (isNone(this.getStart())) {
			this.setStart(TimePicker.getTimstamp());
		}

		if (!get(this, 'changeFired') && (!isNone(this.getAttr('endTime')) || !isNone(this.getAttr('endUnix')))) {
			let time = this.getAttr('endTime') || TimePicker.getTimstamp(this.getAttr('endUnix'));
			if (utc) {
				time = TimePicker.utcToLocal(time);
			}
			this.setEnd(time);
		} else if (isNone(this.getEnd())) {
			this.setEnd(TimePicker.getTimstamp());
		}

		if (get(this, 'changeFired')) {
			set(this, 'changeFired', false);
		} else {
			this.setPaper();
		}

		if (!isNone(this.getAttr('minDate'))) {
			let min = this.getAttr('minDate');
			if (isUnix) {
				min = TimePicker.getTimstamp(min);
			}
			min = TimePicker.getMomentDate(min).startOf('day').valueOf();

			if (get(this, '_min') !== min) {
				set(this, '_min', min);
			}
		}

		if (!isNone(get(this, 'maxDate'))) {
			let max = get(this, 'maxDate');
			if (isUnix) {
				max = TimePicker.getTimstamp(max);
			}
			max = TimePicker.getMomentDate(max).endOf('day').valueOf();

			if (get(this, '_max') !== max) {
				set(this, '_max', max);
			}
		}

		if (isNone(get(this, 'activeState'))) {
			this.set('isStart', true);

			this.set('activeState', EmberObject.create({
				state: '',
				isOpen: true,
				isTop: false,
			}));
		}

		let actionList = this.getAttr('actionList');
		if (isNone(actionList)) {
			actionList = [];
		} else {
			let tList = [];
			let sortKey = 400;
			actionList.forEach(item => {
				if (!item.get && !item.set) {
					item = EmberObject.create(item);
				}

				assert("Action list items must contain a `name` property", isNone(get(item, 'name')));

				if (isNone(item, 'id')) {
					set(item, 'id', underscore(get(item, 'name')));
				}

				if (isNone(get(item, 'sort'))) {
					set(item, 'sort', sortKey);
					sortKey += 1;
				}

				set(item, 'selected', false);
				tList.push(item);
			});

			actionList = tList;
		}

		// action list is the list used in the select menu.
		//
		// id {string} - string id passed around for reference to a list item
		// name {string} - the label to display in the list
		// span {number} - the time span in time relational to {type}
		// type {string} - the units used to calculate the time {span}
		// sort {number} - a weighted number used to sort the list
		// selected {boolean} a true if the item is currently the selected item
		actionList.push(EmberObject.create({id: 'daily', name: loc('Daily'), span: 1, type: 'days', sort: 100, selected: false}));
		actionList.push(EmberObject.create({id: 'weekly', name: loc('Weekly'), span: 1, type: 'weeks', sort: 200, selected: false}));
		actionList.push(EmberObject.create({id: 'monthly', name: loc('Monthly'), span: 1, type: 'months', sort: 300, selected: false}));

		set(this, 'actionList', actionList.sortBy('sort'));

		const selected = this.getDefaultAction(actionList);
		set(selected, 'selected', true);
		set(this, 'selected', selected);
	}),

	getDefaultAction(list) {
		if (get(this, 'isCustom')) {
			const span = TimePicker.getDaysApart(this.getStart(), this.getEnd()) + 1;
			return EmberObject.create({name: loc('Custom'), span, type: 'days'});
		} else if (!isEmpty(get(this, 'defaultAction'))) {
			return list.findBy('id', get(this, 'defaultAction'));
		} else {
			const start = this.getStart();
			const end = this.getEnd();
			const startDate = TimePicker.getMomentDate(start);
			const endDate = TimePicker.getMomentDate(end);
			let span = Math.abs(startDate.diff(endDate, 'days'));
			let diff = Number.MAX_VALUE;

			let selected;
			list.forEach(item => {
				const timeSpan = TimePicker.getMomentDate(start).add(item.span, item.type);
				const itemSpan = Math.abs(startDate.diff(timeSpan, 'days'));
				const nDiff = Math.abs(itemSpan - span);
				if (diff > nDiff) {
					selected = item;
					diff = nDiff;
				}
			});
			return selected;
		}
	},

	getStart() {
		return get(this, '_start');
	},

	getEnd() {
		return get(this, '_end');
	},

	setStart(time) {
		time = TimePicker.getMomentDate(time).startOf('day').valueOf();
		if (this.getStart() !== time) {
			set(this, '_start', time);
		}
	},

	setEnd(time) {
		time = TimePicker.getMomentDate(time).endOf('day').valueOf();
		if (this.getEnd() !== time) {
			set(this, '_end', time);
		}
	},

	setActiveState(isStart) {
		set(this, 'isStart', isStart);

		// date range uses on date picker so update
		// the paperDate object to show the seconds date range
		this.setPaper();
	},

	getInterval(direction=0) {
		const { span, type } = this.get('selected');
		const endType = type.replace(/s$/, '');
		let start = TimePicker.getMomentDate(this.getStart());
		let end;

		if (direction === -1) {
			start = start.subtract(span, type).valueOf();
		} else if (direction === 1) {
			start = start.add(span, type).valueOf();
		} else {
			start = start.startOf(endType).valueOf();
		}

		end = TimePicker.getMomentDate(start).add(span, type).subtract(1, 'days').endOf('day').valueOf();

		return { start, end };
	},

	changeInterval(direction=0) {
		const { start, end } = this.getInterval(direction);

		this.setStart(start);
		this.setEnd(end);

		this.triggerDateChange();
	},

	setPaper() {
		let start = this.getStart();
		let end = this.getEnd();

		let timestamp = start;
		let minDate = get(this, '_min');
		let maxDate = get(this, '_max');
		let format = get(this, 'format');

		if (!this.get('isStart')) {
			timestamp = end;
		}

		const startRange = TimePicker.getMomentDate(start).startOf('day').valueOf();
		const endRange = TimePicker.getMomentDate(end).startOf('day').valueOf();

		set(this, 'paper', paperDate({ timestamp, minDate, maxDate, format, range: [startRange, endRange] }));
	},

	triggerDateChange() {
		let start = this.getStart();
		let end = this.getEnd();

		if (get(this, 'utc')) {
			start = TimePicker.utcFromLocal(start);
			end = TimePicker.utcFromLocal(end);
		}

		if (get(this, '_isUnix')) {
			start = TimePicker.getUnix(start);
			end = TimePicker.getUnix(end);
		}

		this.setPaper();

		set(this, 'changeFired', true);
		this.sendAction('onChange', start, end, get(this, 'isCustom'));
	},

	focusActive(isStart) {
		if (isStart) {
			this.$('.state.start > div > input').focus();
		} else {
			this.$('.state.end > div > input').focus();
		}
	},

	actions: {
		intervalBack() {
			if (!get(this, 'disablePrev')) {
				this.changeInterval(-1);
			}
		},

		intervalForward() {
			if (!get(this, 'disableNext')) {
				this.changeInterval(1);
			}
		},

		toggleList() {
			set(this, 'isListOpen', !get(this, 'isListOpen'));
		},

		setFocus(val) {
			if (val === 'start') {
				this.setActiveState(true);
			} else if (val === 'end') {
				this.setActiveState(false);
			}
		},

		selectItem(id) {
			const actions = get(this, 'actionList');
			actions.forEach(item => set(item, 'selected', false));

			set(this, 'isCustom', false);
			set(this, 'selected', actions.objectAt(id));

			set(this, 'isListOpen', false);
			this.changeInterval();
		},

		selectCustom() {
			const actionList = get(this, 'actionList');
			const action = actionList.findBy('selected', true);
			actionList.forEach(item => set(item, 'selected', false));

			const span = TimePicker.getDaysApart(this.getStart(), this.getEnd()) + 1;
			set(this, 'isCustom', true);
			set(this, 'selected', EmberObject.create({name: loc('Custom'), span, type: 'days'}));

			set(this, 'saveAction', action);
			set(this, 'saveStart', this.getStart());
			set(this, 'saveEnd', this.getEnd());

			later(() => {
				this.focusActive(get(this, 'isStart'));
			}, 100);
		},

		applyRange() {
			set(this, 'saveStart', this.getStart());
			set(this, 'saveEnd', this.getEnd());
			set(this, 'isListOpen', false);

			this.triggerDateChange();
		},

		cancelRange() {
			const action = get(this, 'saveAction');
			set(action, 'selected', true);
			set(this, 'selected', action);

			this.setStart(get(this, 'saveStart'));
			this.setEnd(get(this, 'saveEnd'));

			set(this, 'isCustom', false);
			set(this, 'isListOpen', false);
			this.setActiveState(true);
		},

		dateChange(timestamp) {
			let isStart = get(this, 'isStart');
			if (isStart) {
				this.setStart(timestamp);
				if (this.getStart() > this.getEnd()) {
					this.setEnd(TimePicker.getMomentDate(timestamp).add(1, 'days').valueOf());
				}
			} else {
				this.setEnd(timestamp);
			}
			this.setActiveState(isStart);
		},

		updateTime(state, timestamp) {
			let isStart = get(this, 'isStart');
			if (isStart) {
				this.setStart(timestamp);
			} else {
				this.setEnd(timestamp);
			}
			this.setActiveState(!isStart);
		},

		tabAction(evt) {
			evt.stopPropagation();
			evt.preventDefault();
			this.focusActive(!get(this, 'isStart'));
			return false;
		}
	}
});
