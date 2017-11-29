/**
 * @module Components
 *
 */
import $ from 'jquery';
import Component from '@ember/component';
import EmberObject, { set, get, computed } from '@ember/object';
import { next, later } from '@ember/runloop';
import { underscore } from '@ember/string';
import { on } from '@ember/object/evented';
import { isEmpty, isNone } from '@ember/utils';
import { loc } from '@ember/string';
import { assert } from '@ember/debug';
import moment from 'moment';
import layout from '../templates/components/paper-date-range-picker';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import keyEvent from 'ember-paper-time-picker/utils/key-event';

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

	inputDataName: computed('elementId', function() {
		return `range-picker-${get(this, 'elementId')}`;
	}),

	_startDate: computed('_start', function() {
		return TimePicker.getMomentDate(get(this, '_start'));
	}),

	_endDate: computed('_end', function() {
		return TimePicker.getMomentDate(get(this, '_end'));
	}),

	disableNext: computed('selected', '_start', '_max', function() {
		const { start } = this.getInterval(1);
		return get(this, '_max') < start;
	}),

	disablePrev: computed('selected', '_end', '_min', function() {
		const { end } = this.getInterval(-1);
		return get(this, '_min') > end;
	}),

	selectedDayRangeMatch: computed('_startDate', '_endDate', function() {
		return get(this, '_startDate').date() === get(this, '_endDate').date();
	}),
	selectedMonthRangeMatch: computed('_startDate', '_endDate', function() {
		return get(this, '_startDate').month() === get(this, '_endDate').month();
	}),
	selectedYearRangeMatch: computed('_startDate', '_endDate', function() {
		return get(this, '_startDate').year() === get(this, '_endDate').year();
	}),

	selectedDayRange: computed('selected', '_startDate', '_endDate', function() {
		//const { id } = get(this, 'selected');
		//if (id !== 'monthly' && get(this, 'selectedMonthRangeMatch') && get(this, 'selectedYearRangeMatch')) {
			if (!get(this, 'selectedDayRangeMatch')) {
				return `${get(this, '_startDate').format('Do')} - ${get(this, '_endDate').format('Do')}`;
			}
			return get(this, '_startDate').format('Do');
		//}
		//return '';
	}),
	selectedMonthRange: computed('_startDate', '_endDate', function() {
		//if (get(this, 'selectedYearRangeMatch')) {
			if (!get(this, 'selectedMonthRangeMatch')) {
				//return `${get(this, '_startDate').format('MMM Do')} - ${get(this, '_endDate').format('MMM Do')}`;
				return `${get(this, '_startDate').format('MMM')} - ${get(this, '_endDate').format('MMM')}`;
			}
			return get(this, '_startDate').format('MMMM');
		//}
		//return '';
	}),
	selectedYearRange: computed('_startDate', '_endDate', function() {
		if (!get(this, 'selectedYearRangeMatch')) {
			//let f = get(this, 'format');
			//return `${get(this, '_startDate').format(f)} - ${get(this, '_endDate').format(f)}`;
			return `${get(this, '_startDate').format('YY')} - ${get(this, '_endDate').format('YY')}`;
		}
		return get(this, '_startDate').format('YYYY');
	}),

	selectedDateRange: computed('selected', '_start', '_end', 'format', function() {
		const { id } = get(this, 'selected');
		let format = get(this, 'format');
		const start = TimePicker.getMomentDate(this.getStart());
		const end = TimePicker.getMomentDate(this.getEnd());
		if (start.year() !== end.year()) {
			return `${start.format(format)} - ${end.format(format)}`;
		} else if (start.month() !== end.month()) {
			return `${start.format(format)} - ${end.format(format)}`;
		} else {
			if (id === 'monthly') {
				return start.format('MMMM YYYY');
			} else if (start.date() === end.date()) {
				return start.format(format);
			} else {
				return `${start.format(format)} - ${end.format(format)}`;
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

	setup: on('willInsertElement', function() {
		const utc = get(this, 'utc');
		const isUnix = !isNone(get(this, 'startUnix')) || !isNone(get(this, 'endUnix'));
		set(this, '_isUnix', isUnix);

		// get locale converted format str
		let format = get(this, 'format');
		const localeData = moment.localeData();
		const lFormat = localeData.longDateFormat(format);
		if (!isNone(lFormat)) {
			format = lFormat;
		}

		assert(
			`Moment format "${get(this, 'format')}" is not supported. All format strings must be a combination of "DD" "MM" "YYYY" with one of the following delimeters [ -./, ] and no spaces`,
			/^(DD.MM.YYYY|DD.YYYY.MM|MM.DD.YYYY|MM.YYYY.DD|YYYY.MM.DD|YYYY.DD.MM)$/.test(format)
		);

		let dayIndex = format.search(/D(D|o)/);
		set(this, '__dayIndex', dayIndex);
		set(this, '__format', format);

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
		if (isNone(get(this, 'selected'))) {
			this.setSelected();
			this.saveState();
		}

		let elementId = get(this, 'elementId');
		$('body').off(`keydown.${elementId}`);
		$('body').on(`keydown.${elementId}`, keyDownEventHandler(this));

		$('body').off(`click.${elementId}`);
		$('body').on(`click.${elementId}`, clickEventHandler(this));
	}),

	destroy: on('willDestroyElement', function() {
		$('body').off(`keydown.${get(this, 'elementId')}`);
		$('body').off(`click.${get(this, 'elementId')}`);
	}),

	getDefaultAction() {
		if (get(this, 'isCustom')) {
			const span = TimePicker.getDaysApart(this.getStart(), this.getEnd()) + 1;
			return EmberObject.create({name: loc('Custom'), span, type: 'days'});
		} else if (!isEmpty(get(this, 'defaultAction'))) {
			return get(this, 'actionList').findBy('id', get(this, 'defaultAction'));
		} else {
			const start = this.getStart();
			const end = this.getEnd();
			const startDate = TimePicker.getMomentDate(start);
			const endDate = TimePicker.getMomentDate(end);
			let span = Math.abs(startDate.diff(endDate, 'days'));
			let diff = Number.MAX_VALUE;

			let selected;
			get(this, 'actionList').forEach(item => {
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
		let start, end;
		if (!isEmpty(type) && !isNone(span)) {
			const endType = type.replace(/s$/, '');
			start = TimePicker.getMomentDate(this.getStart());

			if (direction === -1) {
				start = start.subtract(span, type).valueOf();
			} else if (direction === 1) {
				start = start.add(span, type).valueOf();
			} else {
				start = start.startOf(endType).valueOf();
			}

			end = TimePicker.getMomentDate(start).add(span, type).subtract(1, 'days').endOf('day').valueOf();
		}
		return { start, end };
	},

	changeInterval(direction=0) {
		let intervalWait = get(this, '__intervalWait');
		if (!isNone(intervalWait)) {
			clearTimeout(intervalWait);
			intervalWait = null;
		}

		const { start, end } = this.getInterval(direction);
		if (!isNone(start) && !isNone(end)) {
			this.setStart(start);
			this.setEnd(end);
			intervalWait = setTimeout(() => {
				this.triggerDateChange();
			}, 500);
		}
		set(this, '__intervalWait', intervalWait);
	},

	/**
	 * sets the paper date object for
	 * the date-picker component to get date information
	 *
	 * @public
	 * @method setPaper
	 */
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

	/**
	 * triggeres a date change event to send off
	 * to listeners of `onChange`
	 *
	 * @public
	 * @method triggerDateChange
	 */
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

	/**
	 * sets the focus to on of the inputs based on the boolean passed in.
	 *
	 * true sets focus to the start time input
	 *
	 * @public
	 * @method focusActive
	 * @params isStart {boolean}
	 */
	focusActive(isStart, selection=0) {
		next(() => {
			let input = (isStart) ? 'start' : 'end';
			let el = this.$(`.state.${input} > input`);
			el.data('selection', selection);
			el.data('position', 0);
			el.focus();
			set(this, '__saveFocus', { isStart, selection });
		});
	},

	/**
	 * Update the start or end time date where the date will also set the other
	 * if it is incalid
	 *
	 * @public
	 * @method updateDates
	 * @params timestamp {number} miliseconds timestamp
	 * @params isStart {boolean} true to set the start time
	 */
	updateDates(timestamp, isStart) {
		if (isStart) {
			this.setStart(timestamp);
			if (this.getStart() > this.getEnd()) {
				this.setEnd(timestamp);
			}
		} else {
			this.setEnd(timestamp);
			if (this.getStart() > this.getEnd()) {
				this.setStart(timestamp);
			}
		}
	},

	/**
	 * set the select menu to the selected type by id
	 *
	 * @public
	 * @method setSelected
	 * @params id {string} the id of the menu type to set as the selected menu item
	 * @return {object} the selected item
	 */
	setSelected(id) {
		// reset selected list
		get(this, 'actionList').forEach(item => set(item, 'selected', false));

		let selected;
		if (isNone(id)) {
			selected = this.getDefaultAction();
		} else if (id === 'custom') {
			set(this, 'isCustom', true);
			const span = TimePicker.getDaysApart(this.getStart(), this.getEnd()) + 1;
			selected = EmberObject.create({id: 'custom', name: loc('Custom'), span, type: 'days'});
		} else {
			set(this, 'isCustom', false);
			selected = get(this, 'actionList').findBy('id', id);
		}

		set(selected, 'selected', true);
		set(this, 'selected', selected);
		return selected;
	},

	/**
	 * Save the current state of the select menu and
	 * start end dates
	 *
	 * @public
	 * @method saveState
	 */
	saveState() {
		let id = get(this, 'selected.id');
		set(this, '__saveState', {
			isCustom: id === 'custom',
			selectedId: id,
			start: this.getStart(),
			end: this.getEnd()
		});
	},

	/**
	 * restore the state to the previous state of the select menu
	 * and start end dates
	 *
	 * @public
	 * @method restoreState
	 */
	restoreState() {
		if (!isNone(get(this, '__saveState'))) {
			this.setStart(get(this, '__saveState.start'));
			this.setEnd(get(this, '__saveState.end'));
			this.setSelected(get(this, '__saveState.selectedId'));
		}
	},

	closeMenu() {
		let focus = this.$('.date-range-picker-dropdown > .focus');
		if (focus.length) {
			focus.removeClass('focus');
		}
		set(this, 'isListOpen', false);
	},

	openMenu() {
		set(this, 'isListOpen', true);
		this.focusActive(get(this, 'isStart'));
	},

	click(event) {
		if (get(this, 'isListOpen')) {
			let el = $(event.target);
			if (el.parents('.date-range-picker-menu').length || el.hasClass('date-range-picker-menu')) {
				let focus = get(this, '__saveFocus');
				this.focusActive(focus.isStart, focus.selected);
			}
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
			if (!get(this, 'isListOpen')) {
				this.openMenu();
			} else {
				this.closeMenu();
			}
		},

		setFocus(val, event) {
			let index = event.target.selectionStart;
			if (val === 'start') {
				this.setActiveState(true);
				set(this, '__saveFocus', { isStart: true, selected: index });
			} else if (val === 'end') {
				this.setActiveState(false);
				set(this, '__saveFocus', { isStart: false, selected: index });
			}
		},

		selectItem(id) {
			this.saveState();
			this.setSelected(id);
			this.closeMenu();
			this.changeInterval();
		},

		selectCustom() {
			this.saveState();
			this.setSelected('custom');
			later(() => {
				this.focusActive(get(this, 'isStart'));
			}, 100);
		},

		applyRange() {
			this.saveState();
			this.setSelected('custom');
			this.closeMenu();
			this.setActiveState(true);
			this.triggerDateChange();
		},

		cancelRange() {
			this.restoreState();
			this.closeMenu();
			this.setActiveState(true);
		},

		dateChange(timestamp) {
			this.updateDates(timestamp, get(this, 'isStart'));
			this.setActiveState(get(this, 'isStart'));
			this.saveState();
		},

		updateTime(state, timestamp) {
			this.updateDates(timestamp, get(this, 'isStart'));
			this.setActiveState(get(this, 'isStart'));
			this.saveState();
			this.focusActive(!get(this, 'isStart'), get(this, '__dayIndex'));
		},

		tabAction() {
			this.focusActive(!get(this, 'isStart'));
		}
	}
});

function findAction(target, key) {
	let actions = get(target, 'actionList').map(i => {
		let id = i.id;
		let regx = new RegExp('^' + id.charAt(0).toUpperCase() + '$');
		return { id, regx };
	});
	actions.push({ id: 'custom', regx: /^C$/});
	let res = actions.find(i => i.regx.test(key));
	if (isNone(res)) {
		res = { id: null, regx: null };
	}
	return res;
}

function handleAltKeys(target, keyName, isOpen) {
	let selectedId = get(target, 'selected.id');
	let { id } = findAction(target, keyName);
	if (keyName === 'P') {
		target.send('toggleList');
	} else {
		if (!isNone(id)) {
			if (selectedId !== id) {
				if (id === 'custom') {
					if (!isOpen) {
						target.send('selectCustom');
					}
					target.send('toggleList');
				} else {
					target.send('selectItem', id);
				}
			}
		}
	}
}

function keyDownEventHandler(target) {
	return function(event) {
		let isOpen = get(target, 'isListOpen');
		let handler = keyEvent({ event });
		if (event.altKey) {
			if (handler.type === 'letters') {
				handleAltKeys(target, handler.keyName, isOpen);
			}
		} else {
			if (handler.keyName === 'tab') {
				if (isOpen) {
					target.send('tabAction', event);
				}
			} else if (handler.keyName === 'esc') {
				if (isOpen) {
					target.send('toggleList');
				}
			} else if (handler.keyName === 'left-arrow') {
				if (!isOpen) {
					target.send('intervalBack');
				}
			} else if (handler.keyName === 'right-arrow') {
				if (!isOpen) {
					target.send('intervalForward');
				}
			} else if (handler.keyName === 'down-arrow') {
				if (isOpen) {
					nextListItem(target);
				}
			} else if (handler.keyName === 'up-arrow') {
				if (isOpen) {
					prevListItem(target);
				}
			} else if (handler.keyName === 'enter') {
				if (isOpen) {
					let selected = target.$('.date-range-picker-dropdown > .focus');
					if (selected.length) {
						selected.click();
					}
				}
			}
		}
		return true;
	}
}

function nextListItem(target) {
	let element = target.$('.date-range-picker-dropdown');
	let active = element.find('.focus');
	if (!active.length) {
		active = element.find('.active');
	}

	let next = active.next('.item');
	if (!next.length) {
		next = element.children().first();
	}
	next.addClass('focus');
	active.removeClass('focus');
}

function prevListItem(target) {
	let element = target.$('.date-range-picker-dropdown');
	let active = element.find('.focus');
	if (!active.length) {
		active = element.find('.active');
	}

	let next = active.prev('.item');
	if (!next.length) {
		next = element.children('.item').last();
	}
	next.addClass('focus');
	active.removeClass('focus');
}


function clickEventHandler(target) {
	return function(evt) {
		let el = $(evt.target);
		let isOpen = get(target, 'isListOpen');
		if (isOpen) {
			if (el.parents('.paper-date-range-picker').length) { // is in date picker
				if (!el.parents('.date-range-picker-dropdown').length && !el.hasClass('select') && !el.hasClass('date-range-picker-dropdown')) {
					target.send('toggleList');
				}
			} else {
				target.send('toggleList');
			}
		}
	}
}
