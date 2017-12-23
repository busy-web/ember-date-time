/**
 * @module Components
 *
 */
import Component from '@ember/component';
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';
import { on } from '@ember/object/evented';
import { get, getWithDefault, set, computed, observer } from '@ember/object';
import _time from '@busy-web/ember-date-time/utils/time';
import { isInBounds, getDate, getHourMinute } from '@busy-web/ember-date-time/utils/clock/data';
import { createMetaFor, metaFor } from '@busy-web/ember-date-time/utils/clock';
import { numberToString, stringToNumber } from '@busy-web/ember-date-time/utils/clock/string';
import { HOUR_FLAG, MINUTE_FLAG } from '@busy-web/ember-date-time/utils/clock/base';

import layout from '../../templates/components/private/time-picker';

/***/

/**
 * `Component/TimePicker`
 *
 * @class TimePicker
 * @namespace Components
 * @extends Component
 */
export default Component.extend({
	classNames: ['busyweb', 'emberdatetime', 'p-time-picker'],
	layout: layout,

	stateManager: null,

	/**
	 * timestamp that is passed in when using date picker
	 *
	 * @public
	 * @property timestamp
	 * @type Number
	 */
	timestamp: null,

	/**
	 * format for displaying dates
	 *
	 * @public
	 * @property format
	 * @type string
	 */
	format: 'MMM DD, YYYY',

	/**
	 * can be passed in so a date before the minDate cannot be selected
	 *
	 * @public
	 * @property minDate
	 * @type Number
	 * @optional
	 */
	minDate: null,

	/**
	 * can be passed in so a date after the maxDate cannot be selected
	 *
	 * @public
	 * @property maxDate
	 * @type Number
	 * @optional
	 */
	maxDate: null,

	round: 5,
	selectRound: 1,

	section: HOUR_FLAG,

	initialize: on('init', function() {
		this.timeChange();
		this.sectionChage();

		// TODO:
		// pass format from parent element
		//set(this, 'format', get(this, 'stateManager.format'));

		let min = get(this, 'stateManager.minDate');
		let max = get(this, 'stateManager.maxDate');

		set(this, 'minDate', min);
		set(this, 'maxDate', max);

		set(this, 'round', getWithDefault(this, 'stateManager.round', 5));
		set(this, 'selectRound', getWithDefault(this, 'stateManager.selectRound', 1));

		// create hours clock meta object
		createMetaFor(this, HOUR_FLAG, 1, 12, min, max, 1);

		// create minutes clock meta object
		createMetaFor(this, MINUTE_FLAG, 0, 59, min, max, get(this, 'round'), get(this, 'selectRound'));
	}),

	renderPicker: on('didInsertElement', function() {
		this.resetTimeElements();
	}),

	timeChange: observer('stateManager.timestamp', function() {
		if (get(this, 'timestamp') !== get(this, 'stateManager.timestamp')) {
			set(this, 'timestamp', get(this, 'stateManager.timestamp'));
			this.resetTimeElements();
		}
	}),

	sectionChage: observer('stateManager.section', function() {
		let section = get(this, 'stateManager.section');
		if (section === 'meridian') {
			section = HOUR_FLAG;
		}

		if (section === HOUR_FLAG || section === MINUTE_FLAG) {
			//assert(`stateManager.section passed an unknown flag [${section}] time-picker only supports ${HOUR_FLAG} and ${MINUTE_FLAG}`, section === HOUR_FLAG || section === MINUTE_FLAG);

			set(this, 'section', section);
			if (get(this, '_state') === 'inDOM') {
				this.resetTimeElements();
			}
		}
	}),

	/**
	 * current hour of timestamp displayed in clock header
	 *
	 * @private
	 * @property hours
	 * @type String
	 */
	hours: computed('timestamp', function() {
		return numberToString(this.getCurrentTimeByType(HOUR_FLAG));
	}).readOnly(),

	/**
	 * current minute of timestamp displayed in clock header
	 *
	 * @private
	 * @property minutes
	 * @type String
	 */
	minutes: computed('timestamp', function() {
		return numberToString(this.getCurrentTimeByType(MINUTE_FLAG));
	}).readOnly(),

	/**
	 * current date of timestamp displayed in clock footer
	 *
	 * @private
	 * @property currentDate
	 * @type String
	 */
	currentDate: computed('timestamp', 'format', function() {
		return _time(get(this, 'timestamp')).format(get(this, 'format'));
	}).readOnly(),

	meridian: computed('timestamp', function() {
		return _time(get(this, 'timestamp')).format('A');
	}).readOnly(),

	isHourPicker: computed('section', function() {
		return get(this, 'section') === HOUR_FLAG;
	}),

	isAM: computed('meridian', function() {
		return _time(get(this, 'timestamp')).format('A') === 'AM';
	}),

	isPM: computed('meridian', function() {
		return _time(get(this, 'timestamp')).format('A') === 'PM';
	}),

	getCurrentTimeByType(type) {
		return getHourMinute(type, get(this, 'timestamp'), getWithDefault(this, 'selectRounder', 1));
	},

	resetTimeElements() {
		this.renderClock();
		this.cleanClock();

		const time = this.getCurrentTimeByType(get(this, 'section'));
		if (get(this, 'lastActive') !== time) {
			set(this, 'lastActive', time);
			this.setTimestamp(time);
		}
	},

	/**
	 * sets up the active time classes and removes the lst active times
	 *
	 * @private
	 * @method setActiveTime
	 */
	setActiveTime() {
		if (get(this, '_state') === 'inDOM') {
			const value = this.getCurrentTimeByType(get(this, 'section'));
			if (!isNone(value)) {
				const clock = metaFor(this, get(this, 'section'));
				if (!isNone(get(this, 'lastActive'))) {
					clock.unselectPlot(get(this, 'lastActive'));
				}
				clock.selectPlot(value);
				set(this, `lastActive`, value);
				this.dragHandler(value);
			}
		}
	},

	/**
	 * converts moment object to a unix timestamp, and sets that to the global timestamp
	 *
	 * @private
	 * @method saveTimestamp
	 * @param date {object} moment object that will be the new timestamp
	 */
	saveTimestamp(date) {
		if (!get(this, 'isDestroyed') && get(this, 'timestamp') !== date.valueOf()) {
			const bounds = isInBounds(date, get(this, 'minDate'), get(this, 'maxDate'));
			if (bounds.isBefore || bounds.isAfter) {
				this.setAvailableTimestamp(bounds);
			} else {
				// save the current date as the timestamp
				set(this, 'timestamp', date.valueOf());
			}
		}
	},

	setAvailableTimestamp(bounds) {
		if (bounds.isBefore) {
			this.saveTimestamp(_time(get(this, 'minDate')));
		} else if (bounds.isAfter) {
			this.saveTimestamp(_time(get(this, 'maxDate')));
		} else {
			assert(`error trying to setAvailableTimestamp with bounds isBefore: ${bounds.isBefore} and isAfter: ${bounds.isAfter}`, false);
		}
	},

	/**
	 * sets the timestamp to be the passed minute
	 *
	 * @private
	 * @method setTimestamp
	 * @param minute {number} minute to be set to timestamp
	 */
	setTimestamp(value) {
		const time = getDate(get(this, 'section'), value, get(this, 'timestamp'));
		this.saveTimestamp(time);
		this.setActiveTime();
	},

	renderClock() {
		if (get(this, '_state') === 'inDOM') {
			const clock = metaFor(this, get(this, 'section'));
			clock.render(get(this, 'timestamp'));
		}
	},

	/**
	 * remove initial circles and lines for clock
	 *
	 * @private
	 * @method cleanClock
	 */
	cleanClock() {
		if (get(this, '_state') === 'inDOM') {
			const clock = metaFor(this, get(this, 'section'));
			clock.cleanup();
		}
	},


	/**
	 * handles all the function events for dragging on the hours clock
	 * dragHandler must contain start, move and stop functions within it
	 *
	 * @private
	 * @method dragHandler
	 * @param hour {string} hour thats being dragged
	 * @event drag
	 */
	dragHandler(value) {
		if (get(this, '_state') === 'inDOM') {
			const clock = metaFor(this, get(this, 'section'));
			clock.handleDrag(value, point => {
				// set the time according to the new angle
				this.setTimestamp(point.num);

				// notify listeners an update has occured
				this.sendAction('onUpdate', get(this, 'section'), get(this, 'timestamp'));
			});
		}
	},

	actions: {
		clickHours(hour) {
			// set time and remove last active
			this.setTimestamp(hour);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', HOUR_FLAG, get(this, 'timestamp'));
		},

		clickMinutes(minute) {
			if (get(this, 'lastActive') !== minute) {
				// set time and remove last active
				this.setTimestamp(minute);

				// notify event listeners that an update has occurred
				this.sendAction('onUpdate', MINUTE_FLAG, get(this, 'timestamp'));
			}
		},

		/**
		 * sets the clicked hour to active and makes the active hour draggable
		 *
		 * @param hour {string} hour clicked on clock
		 * @event clickHour
		 */
		clickHour(hour) {
			// convert hour to integer
			hour = stringToNumber(hour);

			// set time and remove last active
			this.setTimestamp(hour);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', HOUR_FLAG, get(this, 'timestamp'));
		},

		/**
		 * handles clicking on minutes
		 *
		 * @param minute {string} minute clicked on clock
		 * @event minuteClicked
		 */
		minuteClicked(minute) {
			// convert minute to integer
			minute = stringToNumber(minute);

			// set time and remove last active
			this.setTimestamp(minute);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', MINUTE_FLAG, get(this, 'timestamp'));
		},

		/**
		 * handles clicking AM && PM, wont allow if it goes under min date
		 *
		 * @event meridianChange
		 */
		meridianChange(type) {
			let time;
			if (type === 'AM' && get(this, 'meridian') === 'PM') {
				time = _time(get(this, 'timestamp')).subtract(12, 'hours');
			} else if (type === 'PM' && get(this, 'meridian') === 'AM') {
				time = _time(get(this, 'timestamp')).add(12, 'hours');
			}

			if (!isNone(time)) {
				// save new time
				this.saveTimestamp(time);

				// notify event listeners that an update has occurred
				this.sendAction('onUpdate', 'meridian', get(this, 'timestamp'));
			}
		},

		/**
		 * handles clicking the hour in the header
		 *
		 * @event hourHeaderClicked
		 */
		hourHeaderClicked() {
			set(this, 'isHourPicker', true);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', HOUR_FLAG, get(this, 'timestamp'));
		},

		/**
		 * handles clicking the minute in the header
		 *
		 * @event minuteHeaderClicked
		 */
		minuteHeaderClicked() {
			set(this, 'isHourPicker', false);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', MINUTE_FLAG, get(this, 'timestamp'));
		}
	}
});

