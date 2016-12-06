/**
 * @module Components
 *
 */
import Ember from 'ember';
import layout from '../../templates/components/interfaces/time-picker';
import moment from 'moment';
import Assert from 'busy-utils/assert';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import DragDrop from 'ember-paper-time-picker/utils/drag-drop';

const kHourMin = 1;
const kHourMax = 12;
const kMinuteMin = 0;
const kMinuteMax = 59;
const kHourFlag = 'hours';
const kMinuteFlag = 'minutes';

/**
 * TODO:
 * snap-utils already includes the snap-svg library.
 * You should have a method in there to create a new Snap() instance.
 */
import Snap from 'snap-svg';
import SnapUtils from 'ember-paper-time-picker/utils/snap-utils';

/**
 * `Component/TimePicker`
 *
 * @class TimePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({
	/**
	 * @private
	 * @property classNames
	 * @type String
	 * @default time-picker
	 */
	classNames: ['paper-time-picker'],
	layout: layout,

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

	/**
	 * can be passed in as true or false, true sets timepicker to handle unix timestamp * 1000, false sets it to handle unix timestamp
	 *
	 * @public
	 * @property isMilliseconds
	 * @type boolean
	 * @optional
	 */
	isMilliseconds: false,

	/**
	 * group of snap svg elements
	 *
	 * @private
	 * @property lastGroup
	 * @type Object
	 */
	lastGroup: null,

	/**
	 * last active minute
	 *
	 * @private
	 * @property lastMinute
	 * @type String
	 */
	lastMinute: null,

	lastHours: null,
	lastMinutes: null,

	/**
	 * current hour of timestamp displayed in clock header
	 *
	 * @private
	 * @property hours
	 * @type String
	 */
	hours: null,

	/**
	 * current minute of timestamp displayed in clock header
	 *
	 * @private
	 * @property minutes
	 * @type String
	 */
	minutes: null,

	/**
	 * current date of timestamp displayed in clock footer
	 *
	 * @private
	 * @property currentDate
	 * @type String
	 */
	currentDate: null,

	/**
	 * style attribute for am button
	 *
	 * @private
	 * @property amButtonState
	 * @type string
	 */
	amButtonState: null,

	/**
	 * style attribute for pm button
	 *
	 * @private
	 * @property pmButtonState
	 * @type string
	 */
	pmButtonState: null,

	/**
	 * style attribute for hour header
	 *
	 * @private
	 * @property hoursHeaderState
	 * @type string
	 */
	hoursHeaderState: null,

	/**
	 * style attribute for minutes header
	 *
	 * @private
	 * @property minutesHeaderState
	 * @type string
	 */
	minutesHeaderState: null,

	/**
	 * style attribute for clockHours
	 *
	 * @private
	 * @property clockHoursState
	 * @type string
	 */
	clockHoursState: null,

	/**
	 * style attribute for clockMinutes
	 *
	 * @private
	 * @property clockMinutesState
	 * @type string
	 */
	clockMinutesState: null,

	/**
	 * style attribute for outsideHoursContainer
	 *
	 * @private
	 * @property outsideHoursContainerState
	 * @type string
	 */
	outsideHoursContainerState: null,

	/**
	 * style attribute for outsideHoursContainerBottom
	 *
	 * @private
	 * @property outsideHoursContainerBottomState
	 * @type string
	 */
	outsideHoursContainerBottomState: null,

	isHourPicker: true,

	/**
	 * Get a monent object from a timestamp that could be seconds or milliseconds
	 *
	 * @public
	 * @method getMomentDate
	 * @param timestamp {number}
	 * @return {moment}
	 */
	getMomentDate(timestamp) {
		if (this.get('isMilliseconds')) {
			return moment.utc(timestamp);
		} else {
			return moment.utc(timestamp*1000);
		}
	},

	getCurrentHour() {
		const time = this.getMomentDate(this.get('timestamp'));
		let hour = time.hour();
		if (this.get('meridian') === 'PM') {
			hour = time.hour() - 12;
		}

		if (hour === 0) {
			hour = 12;
		}

		return hour;
	},

	getCurrentMinute() {
		const time = this.getMomentDate(this.get('timestamp'));
		return time.minute();
	},

	getCurrentTimeByType(type) {
		if (type === kHourFlag) {
			return this.getCurrentHour();
		} else if (type === kMinuteFlag) {
			return this.getCurrentMinute();
		} else {
			Assert.throw(`Invalid type [${type}] passed to removeClockTime, valid types are ${kHourFlag} and ${kMinuteFlag}`);
		}
	},

	/**
	 * hides and shows the correct elements once the svgs are inserted
	 *
	 * @private
	 * @method didInsertElement
	 * @constructor
	 */
	insertTimePicker: Ember.on('didInsertElement', function() {
		if (!this.get('isDestroyed')) {
			this.removeClockTime(kHourFlag, kHourMin, kHourMax);
			this.removeClockTime(kMinuteFlag, kMinuteMin, kMinuteMax);

			this.observeMinuteOrHour();
			this.observesAmPm();
		}
	}),

	meridian: Ember.computed('timestamp', function() {
		const time = this.getMomentDate(this.get('timestamp'));
		return time.format('A');
	}),

	observeMinuteOrHour: Ember.observer('isHourPicker', 'isClock', function() {
		if (this.get('isHourPicker')) {
			this.send('hourHeaderClicked');
		} else {
			this.send('minuteHeaderClicked');
		}
	}),

	/**
	 * initially sets the clocks based on the passed time
	 *
	 * @private
	 * @method setUpClock
	 */
	setUpClock: Ember.on('init', Ember.observer('timestamp', function() {
		if (!Ember.isNone(this.get('timestamp'))) {
			let currentHour = TimePicker.formatNumber(this.getCurrentHour());
			let currentMinute = TimePicker.formatNumber(this.getCurrentMinute());

			this.set('hours', currentHour);
			this.set('minutes', currentMinute);

			this.clickableDate();
		}
	})),

	/**
	 * formats date in bottom left corner
	 *
	 * @private
	 * @method clickableDate
	 */
	clickableDate: Ember.observer('timestamp', function() {
		const time = this.getMomentDate(this.get('timestamp'));
		let format = time.format(this.get('format'));
		this.set('currentDate', format);
	}),

	/**
	 * applies and removes correct classes to AM PM buttons
	 *
	 * @private
	 * @method observesAmPm
	 */
	observesAmPm: Ember.observer('meridian', function() {
		if (!this.get('isDestroyed')) {
			this.$('.am-button').removeClass('active');
			this.$('.pm-button').removeClass('active');

			if(this.get('meridian') === 'AM') {
				this.$('.am-button').addClass('active');
			} else {
				this.$('.pm-button').addClass('active');
			}
		}
	}),

	/**
	 * checks for min/max dates and calls setHourDisabled()
	 *
	 * @private
	 * @method minMaxHourHandler
	 */
	minMaxHourHandler: Ember.observer('timestamp', 'isHourPicker', function() {
		if (!this.get('isDestroyed') && this.get('isHourPicker')) {
			this.minMaxHandler(kHourFlag, kHourMin, kHourMax);
		}
	}),

	/**
	 * checks for min/max dates and calls setMinuteDisabled()
	 *
	 * @private
	 * @method minMaxMinuteHandler
	 */
	minMaxMinuteHandler: Ember.observer('timestamp', 'isHourPicker', function() {
		if (!this.get('isDestroyed') && !this.get('isHourPicker')) {
			this.minMaxHandler(kMinuteFlag, kMinuteMin, kMinuteMax);
		}
	}),

	resetClockHands: Ember.observer('timestamp', 'isHourPicker', function() {
		if (this.get('isHourPicker')) {
			this.removeClockTime(kHourFlag, kHourMin, kHourMax);
			this.setActiveTime(kHourFlag);
		} else {
			this.removeClockTime(kMinuteFlag, kMinuteMin, kMinuteMax);
			this.setActiveTime(kMinuteFlag);
		}
	}),

	minMaxHandler(type, rangeStart, rangeEnd) {
		const id = this.$().attr('id');
		for (let time=rangeStart; time<=rangeEnd; time++) {
			SnapUtils.enableClockNumber(type, time, id);

			const date = this.getDateFromTime(type, time);
			const bounds = this.isWithinMinMax(date);
			if (bounds.isBefore || bounds.isAfter) {
				SnapUtils.disableClockNumber(type, time, id);
			}
		}
	},

	isWithinMinMax(date) {
		Assert.funcNumArgs(arguments, 1, true);
		Assert.isMoment(date);

		let isBefore = false;
		let isAfter = false;
		if (!Ember.isNone(this.get('minDate')) || !Ember.isNone(this.get('maxDate'))) {
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

			// if time is before minDate or after maxDate then its invalid
			isBefore = date.isBefore(minDate);
			isAfter = date.isAfter(maxDate);
		}
		return { isBefore, isAfter };
	},

	/**
	 * remove initial circles and lines for minutes clock
	 *
	 * @private
	 * @method removeClockTime
	 * @param type {string}
	 * @param rangeStart {number}
	 * @param rangeEnd {number}
	 */
	removeClockTime(type, rangeStart, rangeEnd) {
		for (let time=rangeStart; time<=rangeEnd; time++) {
			SnapUtils.addElement(type, time, this.$().attr('id'));
		}

		if (type === kHourFlag) {
			this.minMaxHourHandler();
		} else if (type === kMinuteFlag) {
			this.minMaxMinuteHandler();
		} else {
			Assert.throw(`Invalid type [${type}] passed to removeClockTime, valid types are ${kHourFlag} and ${kMinuteFlag}`);
		}
	},

	/**
	 * sets up the active time classes and removes the lst active times
	 *
	 * @private
	 * @method setActiveTime
	 * @param type {string} type to set time for hours or minutes
	 */
	setActiveTime(type) {
		Assert.isString(type);
		if (!this.get('isDestroyed')) {
			const lastActive = this.get(`lastActive`);
			if (!Ember.isNone(lastActive)) {
				SnapUtils.addElement(type, lastActive, this.$().attr('id'));
			}

			const value = this.getCurrentTimeByType(type);
			SnapUtils.activateClockNumber(type, value, this.$().attr('id'));

			this.set(`lastActive`, value);
			this.newDrag(type, value);
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
		Assert.isMoment(date);
		if (!this.get('isDestroyed')) {
			const bounds = this.isWithinMinMax(date);
			if (bounds.isBefore || bounds.isAfter) {
				this.setAvailableTimestamp(bounds);
			} else {
				let timestamp;
				if (this.get('isMilliseconds')) {
					timestamp = date.valueOf();
				} else {
					timestamp = date.unix();
				}

				this.set('timestamp', timestamp);
			}
		}
	},

	setAvailableTimestamp(bounds) {
		Assert.isObject(bounds);

		if (bounds.isBefore) {
			this.saveTimestamp(this.getMomentDate(this.get('minDate')));
		} else if (bounds.isAfter) {
			this.saveTimestamp(this.getMomentDate(this.get('maxDate')));
		} else {
			Assert.throw(`error trying to setAvailableTimestamp with bounds isBefore: ${bounds.isBefore} and isAfter: ${bounds.isAfter}`);
		}
	},

	/**
	 * Returns the degree of a specified value as it pertains to the
	 * total number passed in.
	 *
	 * @public
	 * @method getDegree
	 * @param value {number} the number to get the degree for
	 * @param total {number} the number that represents 360 degrees in the circle
	 * @return {number}
	 */
	getDegree(type, value) {
		Assert.funcNumArgs(arguments, 2, true);
		Assert.isString(type);
		Assert.isNumber(value);

		const total = type === kHourFlag ? kHourMax : kMinuteMax;
		return (value * (360 / total)) % 360;
	},

	/**
	 * Returns the degree of a specified value as it pertains to the
	 * total number passed in.
	 *
	 * @public
	 * @method getValueFromDegree
	 * @param degree {number} the degree to get the number for
	 * @param total {number} the number that represents 360 degrees in the circle
	 * @return {number}
	 */
	getValueFromDegree(type, degree) {
		Assert.funcNumArgs(arguments, 2, true);
		Assert.isString(type);
		Assert.isNumber(degree);

		const total = type === kHourFlag ? kHourMax : kMinuteMax;
		return Math.round((degree * total) / 360);
	},

	/**
	 * sets the correct hour based on the rotated degrees on the hour drag
	 *
	 * @private
	 * @method getHourByDegree
	 * @param offset {number} difference of point 1 to point 2 on 360 degree axis
	 * @param degree {number} degree from point 1 to point 2
	 */
	setTimeForDegree(type, degree) {
		Assert.isString(type);
		Assert.isNumber(degree);

		if (!this.get('isDestroyed')) {
			let time = this.getValueFromDegree(type, degree);
			this.setTimestamp(type, time);
		}
	},

	/**
	 * sets the timestamp to be the passed minute
	 *
	 * @private
	 * @method setTimestamp
	 * @param minute {number} minute to be set to timestamp
	 */
	setTimestamp(type, value) {
		Assert.isString(type);
		Assert.isNumber(value);

		const time = this.getDateFromTime(type, value);
		this.saveTimestamp(time);
		this.setActiveTime(type);
	},

	getDateFromTime(type, value) {
		const time = this.getMomentDate(this.get('timestamp'));

		if (type === kHourFlag) {
			if (value === 12) {
				value = 0;
			}

			if (this.get('meridian') === 'PM') {
				value = value + 12;
			}

			time.hour(value);
		} else if (type === kMinuteFlag) {
			time.minute(value);
		} else {
			Assert.throw(`Invalid type [${type}] passed to setTimestamp, valid types are ${kHourFlag} and ${kMinuteFlag}`);
		}
		return time;
	},

	/**
	 * handles all the function events for dragging on the hours clock
	 * newDrag must contain start, move and stop functions within it
	 *
	 * @private
	 * @method newDrag
	 * @param hour {string} hour thats being dragged
	 * @event newDrag
	 */
	newDrag(type, value) {
		if (!this.get('isDestroyed')) {
			const _this = this;
			const id = this.$().attr('id');
			const clock = new Snap(`#${id} #clocks-${type}-svg`);
			const strings = TimePicker.elementNames(type, value);
			const curTimeElement = clock.select(`#${strings.text}`);

			const circle = clock.select(`#big-circle-${type}`);
			const centerX = circle.attr('cx');
			const centerY = circle.attr('cy');

			const offset = this.$().find(`#clocks-${type}-svg`).offset();
			let diffX = offset.left - 4.5;
			let diffY = offset.top - 4;

			const startAngle = this.getDegree(type, value);
			let endAngle = startAngle;

			/**
			 * allows for the hours group to start being dragged
			 */
			const start = function() {
				if (diffX < 0 && diffY < 0) {
					const _offset = _this.$().find(`#clocks-${type}-svg`).offset();
					diffX = _offset.left - 4.5;
					diffY = _offset.top - 4;
				}

				this.data('origTransform', this.transform().local);
				if (!Ember.isNone(curTimeElement)) {
					curTimeElement.remove();
					curTimeElement.appendTo(clock);
					curTimeElement.removeClass('interior-white');
				}
			};

			/**
			 * moves the dial on the hour clock while transforming group
			 */
			const move = function(dx, dy, x, y) {
				const nx = x - diffX;
				const ny = y - diffY;
				// get angle of line from center x,y to new nx, ny
				endAngle = DragDrop.lineAngle(nx, ny, centerX, centerY);

				// get the rotational direction from the startAngle to the new endAngle
				const direction = DragDrop.calculateDirection(startAngle, endAngle);

				// add SnapSVG transform for movement
				this.attr({ transform: `r${direction}, ${centerX}, ${centerY}` });
			};

			/**
			 * checks to see where the dragging stops and makes the closest hour active
			 */
			const stop = function() {
				// set the time according to the new angle
				_this.setTimeForDegree(type, endAngle);
			};

			if (!Ember.isNone(this.get('lastGroup'))) {
				const undragPrevious = this.get('lastGroup');
				undragPrevious.undrag();
			}

			const curHours = clock.select(`#${strings.text}`);
			const curLine = clock.select(`#${strings.line}`);
			const curCircle = clock.select(`#${strings.circle}`);

			const typeArray = [curLine, curCircle];
			if (!Ember.isNone(curHours)) {
				typeArray.push(curHours);
			}

			const curGroup = clock.g.apply(clock, typeArray);
			curGroup.drag(move, start, stop);

			this.set('lastGroup', curGroup);
		}
	},

	actions: {

		/**
		 * sets the clicked hour to active and makes the active hour draggable
		 *
		 * @param hour {string} hour clicked on clock
		 * @event clickHour
		 */
		clickHour(hour) {
			// convert hour to integer
			hour = TimePicker.stringToInteger(hour);

			// set time and remove last active
			this.setTimestamp(kHourFlag, hour);
		},

		/**
		 * handles clicking on minutes
		 *
		 * @param minute {string} minute clicked on clock
		 * @event minuteClicked
		 */
		minuteClicked(minute) {
			// convert minute to integer
			minute = TimePicker.stringToInteger(minute);

			// set time and remove last active
			this.setTimestamp(kMinuteFlag, minute);
		},

		/**
		 * handles clicking AM, wont allow if it goes under min date
		 *
		 * @event amClicked
		 */
		amClicked() {
			if (this.get('meridian') === 'PM') {
				const time = this.getMomentDate(this.get('timestamp'));
				time.subtract(12, 'hours');
				this.saveTimestamp(time);
			}
		},

		/**
		 * handles clicking PM, wont allow if it goes over max date
		 *
		 * @event pmClicked
		 */
		pmClicked() {
			if (this.get('meridian') === 'AM') {
				const time = this.getMomentDate(this.get('timestamp'));
				time.add(12, 'hours');
				this.saveTimestamp(time);
			}
		},

		/**
		 * handles clicking the hour in the header
		 *
		 * @event hourHeaderClicked
		 */
		hourHeaderClicked() {
			// switch active header
			this.$('.hours-header').removeClass('inactive');
			this.$('.hours-header').addClass('active');
			this.$('.minutes-header').removeClass('active');
			this.$('.minutes-header').addClass('inactive');

			// open correct container
			this.$('.outside-hours-container').removeClass('inactive');
			this.$('.outside-hours-container').addClass('active');
			this.$('.outside-hours-container-bottom').removeClass('active');
			this.$('.outside-hours-container-bottom').addClass('inactive');

			// select correct clock
			this.$('#clocks-minutes-svg').removeClass('active');
			this.$('#clocks-minutes-svg').addClass('inactive');
			this.$('#clocks-hours-svg').removeClass('inactive');
			this.$('#clocks-hours-svg').addClass('active');

			this.set('isHourPicker', true);

			this.removeClockTime(kHourFlag, kHourMin, kHourMax);

			const time = this.getCurrentHour();
			this.set('lastActive', time);
			this.setTimestamp(kHourFlag, time);
		},

		/**
		 * handles clicking the minute in the header
		 *
		 * @event minuteHeaderClicked
		 */
		minuteHeaderClicked() {
			// switch active header
			this.$('.hours-header').removeClass('active');
			this.$('.hours-header').addClass('inactive');
			this.$('.minutes-header').removeClass('inactive');
			this.$('.minutes-header').addClass('active');

			// open correct container
			this.$('.outside-hours-container').removeClass('active');
			this.$('.outside-hours-container').addClass('inactive');
			this.$('.outside-hours-container-bottom').removeClass('inactive');
			this.$('.outside-hours-container-bottom').addClass('active');

			// select correct clock
			this.$('#clocks-minutes-svg').removeClass('inactive');
			this.$('#clocks-minutes-svg').addClass('active');
			this.$('#clocks-hours-svg').removeClass('active');
			this.$('#clocks-hours-svg').addClass('inactive');

			this.set('isHourPicker', false);

			this.removeClockTime(kMinuteFlag, kMinuteMin, kMinuteMax);

			const time = this.getCurrentMinute();
			this.set('lastActive', time);
			this.setTimestamp(kMinuteFlag, time);
		}
	}
});
