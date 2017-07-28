/**
 * @module Components
 *
 */
import Ember from 'ember';
import { loc } from 'busy-utils';
import layout from '../templates/components/paper-date-range-picker';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';

const { isNone, get, set } = Ember;

export default Ember.Component.extend({
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

	hideTime: true,
	hideDate: false,

	startActiveState: null,
	endActiveState: null,
	isListOpen: false,
	isCustom: false,


	setup: Ember.on('didReceiveAttrs', function() {
		if (isNone(get(this, 'startActiveState'))) {
			set(this, 'startActiveState', Ember.Object.create({
				state: '',
				isOpen: true,
				isTop: false,
			}));
		}

		if (isNone(get(this, 'endActiveState'))) {
			set(this, 'endActiveState', Ember.Object.create({
				state: '',
				isOpen: false,
				isTop: false,
			}));
		}

		let actionList = get(this, 'attrs.actionList.value');
		if (isNone(actionList)) {
			actionList = [];
		} else {
			let tList = [];
			let sortKey = 400;
			actionList.forEach(item => {
				if (!item.get && !item.set) {
					item = Ember.Object.create(item);
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

		actionList.push(Ember.Object.create({name: loc('Daily'), span: 1, type: 'days', sort: 100, selected: false}));
		actionList.push(Ember.Object.create({name: loc('Weekly'), span: 7, type: 'days', sort: 200, selected: false}));
		actionList.push(Ember.Object.create({name: loc('Monthly'), span: 1, type: 'months', sort: 300, selected: false}));

		set(this, 'actionList', actionList.sortBy('sort'));

		const selected = actionList[0];
		set(selected, 'selected', true);
		set(this, 'selected', selected);
	}),

	getStart() {
		if (!isNone(get(this, 'startTime'))) {
			return get(this, 'startTime');
		} else if (!isNone(get(this, 'startUnix'))) {
			return TimePicker.getTimstamp(get(this, 'startUnix'));
		} else {
			return TimePicker.getTimstamp();
		}
	},

	getEnd() {
		if (!isNone(get(this, 'endTime'))) {
			return get(this, 'endTime');
		} else if (!isNone(get(this, 'endUnix'))) {
			return TimePicker.getTimstamp(get(this, 'endUnix'));
		} else {
			return TimePicker.getTimstamp();
		}
	},

	setStart(time) {
		if (!isNone(get(this, 'startTime'))) {
			return set(this, 'startTime', time);
		}

		if (!isNone(get(this, 'startUnix'))) {
			return set(this, 'startUnix', TimePicker.getUnix(time));
		}
	},

	setEnd(time) {
		if (!isNone(get(this, 'endTime'))) {
			return set(this, 'endTime', time);
		}

		if (!isNone(get(this, 'endUnix'))) {
			return set(this, 'endUnix', TimePicker.getUnix(time));
		}
	},

	setActiveState(isStart) {
		set(this, 'startActiveState.isOpen', isStart);
		set(this, 'endActiveState.isOpen', !isStart);
	},

	actions: {
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

			const action = actions.objectAt(0);
			set(action, 'selected', true);

			set(this, 'isCustom', false);
			set(this, 'selected', actions.objectAt(id));
		},

		selectCustom() {
			const actionList = get(this, 'actionList');
			const action = actionList.findBy('selected', true);
			actionList.forEach(item => set(item, 'selected', false));

			const span = TimePicker.getDaysApart(this.getStart(), this.getEnd());
			set(this, 'isCustom', true);
			set(this, 'selected', {name: loc('Custom'), span, type: 'days'});

			set(this, 'saveAction', action);
			set(this, 'saveStart', this.getStart());
			set(this, 'saveEnd', this.getEnd());
		},

		applyRange() {
			set(this, 'saveStart', this.getStart());
			set(this, 'saveEnd', this.getEnd());

			set(this, 'isListOpen', false);
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

		update(/*state, timestamp*/) {
			if (get(this, 'startActiveState.isOpen')) {
				this.setActiveState(false);
			} else {
				this.setActiveState(true);
			}
		}
	}
});
