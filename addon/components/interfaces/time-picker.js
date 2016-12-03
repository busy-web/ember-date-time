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

const kHourMax = 12;
const kMinuteMax = 60;
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

	/**
		* element id for text portion of last active hour
		*
		* @private
		* @property lastText
		* @type String
		*/
	lastHoursText: null,
	lastMinutesText: null,

	/**
		* element id for line portion of last active hour
		*
		* @private
		* @property lastLine
		* @type String
		*/
	lastHoursLine: null,
	lastMinutesLine: null,

	/**
		* element id for circle portion of last active hour
		*
		* @private
		* @property lastCircle
		* @type String
		*/
	lastHoursCircle: null,
	lastMinutesCircle: null,

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
		* if hour or minutes are active
		*
		* @private
		* @property minuteOrHour
		* @type string
		*/
	minuteOrHour: null,

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

	/**
		* checks to see if the current state of the component is DOM editable
		*
		* @private
		* @method currentStatePasses
		* @return {bool} true if the component is in the dom, otherwise false
		*/
		currentStatePasses() {
			return !this.get('isDestroyed');
		},

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

	/**
		* hides and shows the correct elements once the svgs are inserted
		*
		* @private
		* @method didInsertElement
		* @constructor
		*/
	insertTimePicker: Ember.on('didInsertElement', function() {
		const time = this.getMomentDate(this.get('timestamp'));
		if (this.currentStatePasses()) {
			this.removeInitialHours();
			this.removeInitialMinutes();
			this.observeMinuteOrHour();

			if(time.format('A') === 'AM') {
				this.$('.am-button').addClass('am-active');
				this.$('.pm-button').addClass('pm-inactive');
			} else {
				this.$('.pm-button').addClass('pm-active');
				this.$('.am-button').addClass('am-inactive');
			}
		}
	}),

	observeMinuteOrHour: Ember.observer('minuteOrHour', 'isClock', function() {
		if (this.get('minuteOrHour') === 'minute') {
			this.send('minuteHeaderClicked');
		} else if (this.get('minuteOrHour') === 'hour') {
			this.send('hourHeaderClicked');
		}
	}),

	/**
		* initially sets the clocks based on the passed time
		*
		* @private
		* @method setUpClock
		*/
	setUpClock: Ember.on('init', Ember.observer('timestamp', function() {
		const time = this.getMomentDate(this.get('timestamp'));
		if (!Ember.isNone(this.get('timestamp'))) {
			let currentHour = time.format('hh');
			let currentMinute = time.format('mm');

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
	observesAmPm: Ember.observer('timestamp', function() {
		const time = this.getMomentDate(this.get('timestamp'));
		if (this.currentStatePasses()) {
			if(time.format('AM')) {
				this.$('.am-button').removeClass('am-inactive');
				this.$('.pm-button').removeClass('pm-active');

				this.$('.am-button').addClass('am-active');
				this.$('.pm-button').addClass('pm-inactive');
			} else {
				this.$('.am-button').removeClass('am-active');
				this.$('.pm-button').removeClass('pm-inactive');

				this.$('.am-button').addClass('am-inactive');
				this.$('.pm-button').addClass('pm-active');
			}
		}
	}),

	/**
		* checks for min/max dates and calls setHourDisabled()
		*
		* @private
		* @method minMaxHourHandler
		*/
	minMaxHourHandler: Ember.observer('timestamp', function() {
		const maxDate = this.get('maxDate');
		const minDate = this.get('minDate');

		if(!Ember.isNone(minDate) || !Ember.isNone(maxDate)) {
			const time = this.getMomentDate(this.get('timestamp'));
			const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

			let meridian = 'AM';
			if (time.format('A') === 'PM') {
				meridian = 'PM';
			}

			this.setHourDisabled(hours, meridian);
		}
	}),

	/**
		* makes hours disabled if they are exceeding min/max dates
		*
		* @private
		* @method setHourDisabled
		* @param list {array} list of hours in given meridian
		* @param meridean {string} AM or PM
		*/
	setHourDisabled(list, meridean) {
		if (this.currentStatePasses()) {
			const id = this.$().attr('id');
			const clock = new Snap(`#${id} #clocks-hours-svg`);
			const timestamp = this.get('timestamp');

			list.forEach(hour => {
				const time = this.getMomentDate(timestamp);
				const clockHour = TimePicker.stringToInteger(hour);

				clock.select(`#hours-text-${hour}`).removeClass('disabled-hour');

				let newHour;
				if (meridean === 'PM') {
					newHour = time.hour(clockHour + 12);
				} else {
					newHour = time.hour(clockHour);
				}

				if (!Ember.isNone(this.get('minDate')) || !Ember.isNone(this.get('maxDate'))) {
					const minDate = this.getMomentDate(this.get('minDate'));
					const maxDate = this.getMomentDate(this.get('maxDate'));
					if (newHour.isBefore(minDate) || newHour.isAfter(maxDate)) {
						clock.select(`#hours-text-${hour}`).addClass('disabled-hour');
					}
				}
			});
		}
	},

	/**
		* checks for min/max dates and calls setMinuteDisabled()
		*
		* @private
		* @method minMaxMinuteHandler
		*/
	minMaxMinuteHandler: Ember.observer('timestamp', function() {
		if (this.currentStatePasses()) {
			const id = this.$().attr('id');
			const clock = new Snap(`#${id} #clocks-minutes-svg`);
			const time = this.getMomentDate(this.get('timestamp'));

			if (!Ember.isNone(this.get('maxDate')) || !Ember.isNone(this.get('minDate'))) {
				for (let minute = 0; minute < 60; minute++) {
					minute = ('0' + minute).slice(-2);
					const item = TimePicker.formatNumber(minute);

					clock.select(`#section-minutes-${item}`).removeClass('disabled-minute');
					if (!Ember.isNone(clock.select(`#minutes-text-${item}`))) {
						clock.select(`#minutes-text-${item}`).removeClass('disabled-minute');
					}

					const newMinute = time.minute(minute);
					this.setMinuteDisabled(item, newMinute);
				}
			}
		}
	}),

	/**
		* makes minutes disabled if they are exceeding min/max dates
		*
		* @private
		* @method setMinuteDisabled
		* @param oldMinute {string} minute to be tested
		* @param newMinute {string} minute from the timestamp
		*/
	setMinuteDisabled(oldMinute, newMinute) {
		if (this.currentStatePasses()) {
			const id = this.$().attr('id');
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));
			const clock = new Snap(`#${id} #clocks-minutes-svg`);

			if (!Ember.isNone(this.get('minDate')) || !Ember.isNone(this.get('maxDate'))) {
				if (!(newMinute.isBefore(minDate) !== true && newMinute.isAfter(maxDate) !== true)) {
					if (!Ember.isNone(clock.select(`#minutes-text-${oldMinute}`))) {
						clock.select(`#minutes-text-${oldMinute}`).addClass('disabled-minute');
					}
					clock.select(`#section-minutes-${oldMinute}`).addClass('disabled-section');
				}
			}
		}
	},

	/**
		* remove initial circles and lines for hours clock
		*
		* @private
		* @method removeInitialHours
		*/
	removeInitialHours() {
		const time = this.getMomentDate(this.get('timestamp'));
		if (this.currentStatePasses()) {
			let allHours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

			allHours.forEach(item => {
				SnapUtils.removeHour(item, this.$().attr('id'));
			});

			this.removeLastActive(kHourFlag, time.hour());
			this.minMaxHourHandler();
		}
	},

	/**
		* remove initial circles and lines for minutes clock
		*
		* @private
		* @method removeInitialMinutes
		*/
	removeInitialMinutes() {
		const time = this.getMomentDate(this.get('timestamp'));
		if (this.currentStatePasses()) {
			for (let minute = 0; minute < 60; minute++) {
				minute = ('0' + minute).slice(-2);
				SnapUtils.removeMinute(minute, this.$().attr('id'));
			}
			this.removeLastActive(kMinuteFlag, time.minute());
			this.minMaxMinuteHandler();
		}
	},

	/**
		* keeps the clock hands up to date with the current timestamp
		*
		* @private
		* @method updateClockHands
		*/
	updateClockHands: Ember.observer('timestamp', function() {
		const time = this.getMomentDate(this.get('timestamp'));
		this.removeLastActive(kMinuteFlag, time.minute());
		this.removeLastActive(kHourFlag, time.hour());
	}),

	/**
		* removes the last active hour and displays the now active one
		*
		* @private
		* @method removeLastActive
		* @param hour {string} new active hour
		*/
	removeLastActive(type, value) {
		Assert.isString(type);
		Assert.isNumber(value);

		if (this.currentStatePasses()) {
			const lastText = `last${type}Text`;
			const lastLine = `last${type}Line`;
			const lastCircle = `last${type}Circle`;

			const name = Ember.String.singularize(type);
			const valString = TimePicker.formatNumber(value);
			const strings = TimePicker.elementNames(type, valString);

			if (!Ember.isNone(this.get(lastText)) || !Ember.isNone(this.get(lastLine)) || !Ember.isNone(this.get(lastCircle))) {
				let defaultVal = TimePicker.formatNumber(this.get(lastText));
				const fName = Ember.String.classify(name);
				SnapUtils[`remove${fName}`].call(SnapUtils, defaultVal, this.$().attr('id'));
			}

			SnapUtils[`${name}TextActivate`].call(SnapUtils, valString, this.$().attr('id'));

			this.set(lastText, strings.text);
			this.set(lastLine, strings.line);
			this.set(lastCircle, strings.circle);
			this.newDrag(type, value);
		}
	},

	/**
		* converts moment object to a unix timestamp, and sets that to the global timestamp
		*
		* @private
		* @method convertToTimestamp
		* @param date {object} moment object that will be the new timestamp
		*/
	convertToTimestamp(date) {
		Assert.isMoment(date);

		if (this.get('isMilliseconds')) {
			this.set('timestamp', date.valueOf());
		} else {
			this.set('timestamp', date.unix());
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

		if (this.currentStatePasses()) {
			let time = this.getValueFromDegree(type, degree);
			let formatTime = TimePicker.formatNumber(time);

			if (this.isWithinMinMax(type, time)) {
				if (type === kHourFlag) {
					this.removeLastActive(type, time);
				} else {
					this.setMinuteToTimestamp(time);
					SnapUtils.minuteSectionActivate(formatTime, this.$().attr('id'));
					this.removeLastActive(type, time);
				}
			} else {
				this.removeLastActive(type, TimePicker.stringToInteger(this.get(`last${type}Text`)));
			}
		}
	},

	isWithinMinMax(type, value) {
		Assert.funcNumArgs(arguments, 2, true);
		Assert.isString(type);
		Assert.isNumber(value);

		if (!Ember.isNone(this.get('minDate')) || !Ember.isNone(this.get('maxDate'))) {
			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

			if (type === kHourFlag) {
				time.hour(value);
			} else {
				time.minute(value);
			}

			// if time is before minDate or after maxDate then its invalid
			if (time.isBefore(minDate) || time.isAfter(maxDate)) {
				return false;
			}
		}
		return true;
	},

	/**
		* sets the correct minute based on the rotated degrees on the minute drag
		*
		* @private
		* @method getMinuteByDegree
		* @param offset {number} difference of point 1 to point 2 on 360 degree axis
		* @param degree {number} degree from point 1 to point 2
		*/
//	getMinuteByDegree(offset, degree) {
//		if (this.currentStatePasses()) {
//			let minute = (((offset / 6) + (Math.round(degree / 6))) % 60);
//			let formatMinute = TimePicker.formatNumber(minute);
//
//
//		}
//	},

	/**
		* sets the timestamp to be the passed minute
		*
		* @private
		* @method setMinuteToTimestamp
		* @param minute {number} minute to be set to timestamp
		*/
	setMinuteToTimestamp(minute) {
		Assert.isNumber(minute);

		const time = this.getMomentDate(this.get('timestamp'));
		let newMin = time.minute(minute);

		this.convertToTimestamp(newMin);
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
		if (this.currentStatePasses()) {
			const _this = this;
			const id = this.$().attr('id');
			const clock = new Snap(`#${id} #clocks-${type}-svg`);
			const strings = TimePicker.elementNames(type, value);
			const curTimeElement = clock.select(`#${strings.text}`);

			const circle = clock.select(`#big-circle-${type}`);
			const centerX = circle.attr('cx');
			const centerY = circle.attr('cy');

			const offset = this.$().find('svg').offset();
			const diffX = offset.left - 4.5;
			const diffY = offset.top - 4;

			const startAngle = this.getDegree(type, value);
			let endAngle = startAngle;

			/**
				* allows for the hours group to start being dragged
				*/
			const start = function() {
				this.data('origTransform', this.transform().local);
				curTimeElement.remove();
				curTimeElement.appendTo(clock);
				curTimeElement.removeClass('interior-white');
			};

			/**
				* moves the dial on the hour clock while transforming group
				*/
			const move = function(dx, dy, x, y) {
				const nx = x - diffX;
				const ny = y - diffY;
				endAngle = DragDrop.lineAngle(nx, ny, centerX, centerY);

				const direction = DragDrop.calculateDirection(startAngle, endAngle);
				this.attr({ transform: `r${direction}, ${centerX}, ${centerY}` });
			};

			/**
				* checks to see where the dragging stops and makes the closest hour active
				*/
			const stop = function() {
				_this.setTimeForDegree(type, endAngle);
			};

			if (type === 'hours') {
				this.postDragHours(strings);

				if (!Ember.isNone(this.get('lastGroup'))) {
					const undragPrevious = this.get('lastGroup');
					undragPrevious.undrag();
				}

				const curHours = clock.select(`#${strings.text}`);
				const curLine = clock.select(`#${strings.line}`);
				const curCircle = clock.select(`#${strings.circle}`);

				const curGroup = clock.g(curLine, curCircle, curHours);
				curGroup.drag(move, start, stop);

				this.set('lastGroup', curGroup);
			} else {
				if (!Ember.isNone(this.get('lastMinute'))) {
					const undragPrevious = this.get('lastMinute');
					undragPrevious.undrag();
				}

				if (TimePicker.minuteModFive(value))  {
					const curMin = clock.select(`#${strings.text}`);
					const curLine = clock.select(`#${strings.line}`);
					const curCircle = clock.select(`#${strings.circle}`);
					const currentSelect = clock.g(curLine, curCircle, curMin);

					currentSelect.drag(move, start, stop);
					this.set('lastMinute', currentSelect);
				} else {
					const curLine2 = clock.select(`#${strings.line}`);
					const curCircle2 = clock.select(`#${strings.circle}`);
					const currentSelect2 = clock.g(curLine2, curCircle2);

					currentSelect2.drag(move, start, stop);
					this.set('lastMinute', currentSelect2);
				}
			}
		}
	},

	/**
		* sets the dragged hour to the global timestamp
		*
		* @private
		* @method postDragHours
		* @param hour {string} hour to be set to timestamp
		* @event postDragHours
		*/
	postDragHours(strings) {
		const time = this.getMomentDate(this.get('timestamp'));
		if (time.format('hh') !== TimePicker.formatNumber(strings.text)) {
			let setHour = null;
			if (time.format('A') === 'AM') {
				setHour = time.hour(TimePicker.stringToInteger(strings.text));
				this.convertToTimestamp(setHour);
			} else {
				setHour = time.hour(TimePicker.stringToInteger(strings.text) + 12);
				this.convertToTimestamp(setHour);
			}
		}
	},

	/**
		* handles all the function events for dragging on the minutes clock
		* minutesDrag must contain start, move and stop functions within it
		*
		* @private
		* @method minutesDrag
		* @param minute {string} minute thats being dragged
		* @event minutesDrag
		*/
	minutesDrag(minute) {
		if (this.currentStatePasses()) {
			const _this = this;
			const id = this.$().attr('id');
			const strings = TimePicker.elementNames('minutes', minute);
			const clock = new Snap(`#${id} #clocks-minutes-svg`);
			const curMinute = clock.select(`#${strings.text}`);

			let newMinute = TimePicker.stringToInteger(_this.get('lastMinutesCircle'));
			let currentAngle = this.getDegree(newMinute, 60);
			let center_x = 104.75;
			let center_y = 105;

			/**
				* allows for the minutes group to start being dragged
				*/
			const start = function() {
				this.data('origTransform', this.transform().local );
				if (TimePicker.minuteModFive(minute)) {
					curMinute.remove();
					curMinute.appendTo(clock);
					curMinute.removeClass('interior-white');
				}
			};

			/**
				* moves the dial on the minute clock while transforming group
				*/
			const move = function(dx,dy,x,y) {
				const points = DragDrop.angleValues(dx,dy,x,y, _this.$('#center-point-minutes'));
				const angle = TimePicker.angle(points.endX, points.endY, points.startX, points.startY);
				const direction = DragDrop.dragDirection(angle, points, strings.text);

				this.attr({ transform: `r${direction}, ${center_x}, ${center_y}` });

				const min = TimePicker.stringToInteger(_this.get('lastMinutesCircle'));
				currentAngle = _this.getDegree(min, 60);
				newMinute = DragDrop.getNewValue(direction);
			};

			/**
				* checks to see where the dragging stops and makes the closest minute active
				*/
			const stop = function() {
				_this.getMinuteByDegree(currentAngle, newMinute);
			};

			if (!Ember.isNone(this.get('lastMinute'))) {
				const undragPrevious = this.get('lastMinute');
				undragPrevious.undrag();
			}

			if (TimePicker.minuteModFive(minute))  {
				const curMin = clock.select(`#${strings.text}`);
				const curLine = clock.select(`#${strings.line}`);
				const curCircle = clock.select(`#${strings.circle}`);
				const currentSelect = clock.g(curLine, curCircle, curMin);

				currentSelect.drag(move, start, stop);
				this.set('lastMinute', currentSelect);
			} else {
				const curLine2 = clock.select(`#${strings.line}`);
				const curCircle2 = clock.select(`#${strings.circle}`);
				const currentSelect2 = clock.g(curLine2, curCircle2);

				currentSelect2.drag(move, start, stop);
				this.set('lastMinute', currentSelect2);
			}
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
			const time = this.getMomentDate(this.get('timestamp'));
			let hourNumber = TimePicker.stringToInteger(hour);
			if (this.currentStatePasses()) {
				if (time.format('A') === 'PM') {
					hourNumber += 12;
				}

				this.convertToTimestamp(time.hour(hourNumber));
				this.removeLastActive(kHourFlag, hourNumber);
			}
		},

		/**
			* handles clicking on minutes
			*
			* @param minute {string} minute clicked on clock
			* @event minuteClicked
			*/
		minuteClicked(minute) {
			if (this.currentStatePasses()) {
				const min = TimePicker.stringToInteger(minute);
				this.setMinuteToTimestamp(min);
				this.removeLastActive(kMinuteFlag, min);
			}
		},

		/**
			* handles clicking AM, wont allow if it goes under min date
			*
			* @event amClicked
			*/
		amClicked() {
			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));

			let changeable_time = this.getMomentDate(this.get('timestamp'));
			if (this.currentStatePasses()) {
				let newTime = changeable_time;
				newTime.subtract(12, 'hours');

				if (time.format('A') === 'PM') {
					if (!Ember.isNone(this.get('minDate'))) {
						if (!newTime.isBefore(minDate)) {
							this.convertToTimestamp(newTime);
						}
					} else {
						this.convertToTimestamp(newTime);
					}
				}
			}
		},

		/**
			* handles clicking PM, wont allow if it goes over max date
			*
			* @event pmClicked
			*/
		pmClicked() {
			const time = this.getMomentDate(this.get('timestamp'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

			let changeable_time = this.getMomentDate(this.get('timestamp'));
			if (this.currentStatePasses()) {
				let newTime = changeable_time;
				newTime.add(12, 'hours');

				if (time.format('A') === 'AM') {
					if (!Ember.isNone(this.get('maxDate'))) {
						if (!newTime.isAfter(maxDate)) {
							this.convertToTimestamp(newTime);
						}
					} else {
						this.convertToTimestamp(newTime);
					}
				}
			}
		},

		/**
			* handles clicking the hour in the header
			*
			* @event hourHeaderClicked
			*/
		hourHeaderClicked() {
			const time = this.getMomentDate(this.get('timestamp'));
			if (this.currentStatePasses()) {
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

				this.removeInitialHours();
				this.removeLastActive(kHourFlag, time.hour());
			}
		},

		/**
			* handles clicking the minute in the header
			*
			* @event minuteHeaderClicked
			*/
		minuteHeaderClicked() {
			const time = this.getMomentDate(this.get('timestamp'));
			if (this.currentStatePasses()) {
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

				this.removeInitialMinutes();
				this.removeLastActive(kMinuteFlag, time.minute());
			}
		}
	}
});
