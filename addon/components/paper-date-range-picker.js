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
import layout from '../templates/components/paper-date-range-picker';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import paperTime from 'ember-paper-time-picker/utils/paper-time';
import keyEvent from 'ember-paper-time-picker/utils/key-event';
import { longFormatDate } from 'ember-paper-time-picker/utils/date-format-parser';

/**
 *
 */
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
		return paperTime(get(this, '_start'));
	}),

	_endDate: computed('_end', function() {
		return paperTime(get(this, '_end'));
	}),

	disableNext: computed('selected', '_start', '_max', function() {
		const { start } = this.getInterval(1);
		return get(this, '_max') < start;
	}),

	disablePrev: computed('selected', '_end', '_min', function() {
		const { end } = this.getInterval(-1);
		return get(this, '_min') > end;
	}),

	selectedDateRange: computed('selected', '_start', '_end', 'format', function() {
		const { id } = get(this, 'selected');
		const start = paperTime(getStart(this));
		const end = paperTime(getEnd(this));
		if (start.year() !== end.year()) {
			return `${start.format('ll')} - ${end.format('ll')}`;
		} else if (start.month() !== end.month()) {
			return `${start.format('MMM DD')} - ${end.format('MMM DD')}`;
		} else {
			if (id === 'monthly') {
				return start.format('MMMM');
			} else if (start.date() === end.date()) {
				return `${start.format('MMM DD')} - ${end.format('MMM DD')}`;
			} else {
				return `${start.format('MMM DD')} - ${end.format('MMM DD')}`;
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
		format = longFormatDate(format);

		assert(
			`Moment format "${get(this, 'format')}" is not supported. All format strings must be a combination of "DD" "MM" "YYYY" with one of the following delimeters [ -./, ] and no spaces`,
			/^(DD.MM.YYYY|DD.YYYY.MM|MM.DD.YYYY|MM.YYYY.DD|YYYY.MM.DD|YYYY.DD.MM)$/.test(format)
		);

		set(this, '__dayIndex', format.search(/D(D|o)/));
		set(this, '__monthIndex', format.search(/M(M|o)/));
		set(this, '__format', format);

		if (isNone(get(this, 'activeDates'))) {
			set(this, 'activeDates', []);
		}

		if (!get(this, 'changeFired') && (!isNone(this.getAttr('startTime')) || !isNone(this.getAttr('startUnix')))) {
			let time = this.getAttr('startTime') || paperTime.unix(this.getAttr('startUnix')).timestamp();
			if (utc) {
				time = paperTime.utcToLocal(time).timestamp();
			}
			setStart(this, time);
		} else if (isNone(getStart(this))) {
			setStart(this, paperTime().timestamp());
		}

		if (!get(this, 'changeFired') && (!isNone(this.getAttr('endTime')) || !isNone(this.getAttr('endUnix')))) {
			let time = this.getAttr('endTime') || paperTime.unix(this.getAttr('endUnix')).timestamp();
			if (utc) {
				time = paperTime.utcToLocal(time).timestamp();
			}
			setEnd(this, time);
		} else if (isNone(getEnd(this))) {
			setEnd(this, paperTime().timestamp());
		}

		if (get(this, 'changeFired')) {
			set(this, 'changeFired', false);
		} else {
			this.setPaper();
		}

		if (!isNone(this.getAttr('minDate'))) {
			let min = this.getAttr('minDate');
			if (isUnix) {
				min = paperTime.unix(min).timestamp();
			}
			min = paperTime(min).startOf('day').timestamp();

			if (get(this, '_min') !== min) {
				set(this, '_min', min);
			}
		}

		if (!isNone(get(this, 'maxDate'))) {
			let max = get(this, 'maxDate');
			if (isUnix) {
				max = paperTime.unix(max).timestamp();
			}
			max = paperTime(max).endOf('day').valueOf();

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

		let actionList = this.getAttr('actionList') || [];
		if (isEmpty(actionList)) {
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

			actionList = actionList.sort((a, b) => get(a, 'sort') > get(b, 'sort') ? 1 : -1);
			set(this, 'actionList', actionList);
		}

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
			const span = paperTime.daysApart(getStart(this), getEnd(this)) + 1;
			return EmberObject.create({name: loc('Custom'), span, type: 'days'});
		} else if (!isEmpty(get(this, 'defaultAction'))) {
			return get(this, 'actionList').findBy('id', get(this, 'defaultAction'));
		} else {
			const start = getStart(this);
			const end = getEnd(this);
			const startDate = paperTime(start);
			const endDate = paperTime(end);
			let span = Math.abs(startDate.diff(endDate, 'days'));
			let diff = Number.MAX_VALUE;

			let selected;
			get(this, 'actionList').forEach(item => {
				const timeSpan = paperTime(start).add(item.span, item.type);
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


	setActiveState(isStart) {
		set(this, 'isStart', isStart);
	},

	getInterval(direction=0) {
		const { span, type } = this.get('selected');
		let start, end;
		if (!isEmpty(type) && !isNone(span)) {
			const endType = type.replace(/s$/, '');
			start = paperTime(getStart(this));

			if (direction === -1) {
				start = start.subtract(span, type).valueOf();
			} else if (direction === 1) {
				start = start.add(span, type).valueOf();
			} else {
				start = start.startOf(endType).valueOf();
			}

			end = paperTime(start).add(span, type).subtract(1, 'days').endOf('day').valueOf();
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
			setStart(this, start);
			setEnd(this, end);
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
		let start = getStart(this);
		let end = getEnd(this);

		let timestamp = start;
		let calendarDate = get(this, 'calendarDate');
		let minDate = get(this, '_min');
		let maxDate = get(this, '_max');
		let format = get(this, 'format');

		if (!this.get('isStart')) {
			timestamp = end;
		}

		const startRange = paperTime(start).startOf('day').valueOf();
		const endRange = paperTime(end).startOf('day').valueOf();

		set(this, 'paper', paperDate({ timestamp, calendarDate, minDate, maxDate, format, range: [startRange, endRange] }));
	},

	/**
	 * triggeres a date change event to send off
	 * to listeners of `onChange`
	 *
	 * @public
	 * @method triggerDateChange
	 */
	triggerDateChange() {
		let start = getStart(this);
		let end = getEnd(this);

		if (get(this, 'utc')) {
			start = paperTime.utcFromLocal(start);
			end = paperTime.utcFromLocal(end);
		}

		if (get(this, '_isUnix')) {
			start = paperTime(start).unix();
			end = paperTime(end).unix();
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
	focusActive(selection=0) {
		let isStart = get(this, 'isStart');
		set(this, '__saveFocus', { isStart, selection });

		let input = (isStart) ? 'start' : 'end';
		let el = this.$(`.state.${input} > input`);
		el.data('selection', selection);
		el.data('position', 0);

		next(() => el.focus());
	},

	/**
	 * Update the start or end time date where the date will also set the other
	 * if it is incalid
	 *
	 * @public
	 * @method updateDates
	 * @params type {string} the type of setter day or month
	 * @params timestamp {number} milliseconds timestamp
	 * @params calendar {number} milliseconds timestamp
	 * @params singleSet {boolean} flag to only set start or end time unless a special case exists. This is for keyboards inputs
	 */
	updateDates(type, time, calendar, singleSet=false) {
		let isStart = get(this, 'isStart');
		if (type === 'days') {
			if (!singleSet && !isStart && time < getStart(this)) {
				isStart = true;
			}

			// set the start or end time
			// based off the current active state
			if (isStart) {
				setStart(this, time);
			} else {
				setEnd(this, time);
			}

			if (!singleSet && isStart) {
				// if active state is the start and its
				// not a singleSet mode then set the end as well
				setEnd(this, time);
			} else if (isStart && time > getEnd(this)) {
				// if active state is start and the time
				// is greater than the end then set the end time
				setEnd(this, time);
			} else if (!isStart && time < getStart(this)) {
				// if active state is end and the time
				// is less than the start then set the start time
				setStart(this, time);
			}

			// always set the calendar for start times and all
			// single set times
			if (isStart || singleSet) {
				set(this, 'calendarDate', time);
			}

			// set the active state
			this.setActiveState(get(this, 'isStart'));

			// update the dates for the calendar
			this.setPaper();
		} else {
			set(this, 'calendarDate', calendar);
		}
		return isStart;
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
			const span = paperTime.daysApart(getStart(this), getEnd(this)) + 1;
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
			start: getStart(this),
			end: getEnd(this)
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
			setStart(this, get(this, '__saveState.start'));
			setEnd(this, get(this, '__saveState.end'));
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
		this.focusActive();
	},

	click(event) {
		if (get(this, 'isListOpen')) {
			let el = $(event.target);
			if (el.parents('.date-range-picker-menu').length || el.hasClass('date-range-picker-menu')) {
				let focus = get(this, '__saveFocus');
				this.setActiveState(focus.isStart);
				this.focusActive(focus.selected);
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
				this.focusActive();
			}, 100);
		},

		applyRange() {
			this.saveState();
			this.setSelected('custom');
			this.closeMenu();
			this.setActiveState(true);
			this.changeInterval();
		},

		cancelRange() {
			this.restoreState();
			this.closeMenu();
			this.setActiveState(true);
		},

		dateChange(time) {
			this.updateDates('days', time, null, true);
		},

		updateTime(state, time) {
			let isStart = this.updateDates('days', time);
			this.setActiveState(!isStart);

			// resets the focus after the user clicks a day
			this.focusActive(get(this, '__dayIndex'));
		},

		tabAction() {
			this.setActiveState(!get(this, 'isStart'));
			// change focus to next input
			this.focusActive();
		},

		/**
		 * update the clicked value for days and months
		 * and set the focus back to the input when done
		 *
		 */
		calendarChange(type, time, calendar) {
			let isStart;
			if (type === 'days') {
				isStart = this.updateDates(type, time, calendar);
				this.setActiveState(!isStart);
				this.focusActive(get(this, '__dayIndex'));
			} else {
				this.updateDates(type, time, calendar);
				this.focusActive(get(this, '__monthIndex'));
			}
		}
	}
});


function getStart(target) {
	return get(target, '_start');
}

function getEnd(target) {
	return get(target, '_end');
}

function setStart(target, time) {
	time = paperTime(time).startOf('day').valueOf();
	if (getStart(target) !== time) {
		set(target, '_start', time);
	}
}

function setEnd(target, time) {
	time = paperTime(time).endOf('day').valueOf();
	if (getEnd(target) !== time) {
		set(target, '_end', time);
	}
}

function findAction(target, key) {
	let actions = get(target, 'actionList').map(i => {
		let id = i.id;
		let regx = new RegExp('^' + id.charAt(0).toLowerCase() + '$');
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
	if (keyName === '/') {
		target.send('toggleList');
	} else {
		let selectedId = get(target, 'selected.id');
		let { id } = findAction(target, keyName);
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
			if (handler.type === 'letter' || handler.type === 'math') {
				handleAltKeys(target, handler.keyName, isOpen);
			}
		} else {
			if (handler.keyName === 'Tab') {
				if (isOpen) {
					target.send('tabAction', event);
				}
			} else if (handler.keyName === 'Escape') {
				if (isOpen) {
					target.send('toggleList');
				}
			} else if (handler.keyName === 'ArrowLeft') {
				if (!isOpen) {
					target.send('intervalBack');
				}
			} else if (handler.keyName === 'ArrowRight') {
				if (!isOpen) {
					target.send('intervalForward');
				}
			} else if (handler.keyName === 'ArrowDown') {
				if (isOpen) {
					nextListItem(target);
				}
			} else if (handler.keyName === 'ArrowUp') {
				if (isOpen) {
					prevListItem(target);
				}
			} else if (handler.keyName === 'Enter') {
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
