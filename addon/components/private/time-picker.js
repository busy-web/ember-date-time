/**
 * @module Components
 *
 */
import Component from '@ember/component';
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';
import { on } from '@ember/object/evented';
import { Snap } from 'snapsvg';
import { get, set, computed, observer } from '@ember/object';
import _time from '@busy-web/ember-date-time/utils/time';
import { formatNumber, stringToInteger } from '@busy-web/ember-date-time/utils/string';
import { createMetaFor, metaFor } from '@busy-web/ember-date-time/utils/clock';
import DragDrop from '@busy-web/ember-date-time/utils/drag-drop';
import layout from '../../templates/components/private/time-picker';

/***/
const kHourMin = 1;
const kHourMax = 12;
const kMinuteMin = 0;
const kMinuteMax = 59;
const kHourFlag = 'hours';
const kMinuteFlag = 'minutes';

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

	activeState: null,

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
	hours: computed('timestamp', function() {
		return formatNumber(this.getCurrentHour());
	}).readOnly(),

	/**
	 * current minute of timestamp displayed in clock header
	 *
	 * @private
	 * @property minutes
	 * @type String
	 */
	minutes: computed('timestamp', function() {
		return formatNumber(this.getCurrentMinute());
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

	visibleNumHours: 12,
	clickableNumHours: 12,
	visibleNumMin: 12,
	clickableNumMin: 60,

	initialize: on('init', function() {
		this.setupTime();

		// create hours clock meta object
		createMetaFor(this, 'hours', 1, 12, 1);

		// create minutes clock meta object
		createMetaFor(this, 'minutes', 0, 59, 5);
	}),

	renderPicker: on('didInsertElement', function() {
		this.observesAmPm();
		console.log('renderPicker');
		this.resetClockHands();
	}),

	setupTime: observer('activeState.timestamp', function() {
		// TODO:
		// pass format from parent element
		//set(this, 'format', get(this, 'activeState.format'));
		set(this, 'minDate', get(this, 'activeState.minDate'));
		set(this, 'maxDate', get(this, 'activeState.maxDate'));
		set(this, 'timestamp', get(this, 'activeState.timestamp'));
	}),

	resetClockHands() { //observer('activeState.timestamp', 'activeState.section', function() {
		console.log('resetClockHands');
		let section = get(this, 'activeState.section');
		if (section === 'meridian') {
			section = 'hours';
		}
		set(this, 'isHourPicker', section === 'hours');

		if (section === 'hours' || section === 'minutes') {
			let type, min, max;
			if (section === 'hours') {
				type = kHourFlag;
				min = kHourMin;
				max = kHourMax;
			} else if (section === 'minutes') {
				type = kMinuteFlag;
				min = kMinuteMin;
				max = kMinuteMax;
			}

			if (this.$() && this.$().length) {
				this.resetTimeElements(type, min, max);
			}
		}
	}, //),

	/**
	 * applies and removes correct classes to AM PM buttons
	 *
	 * @private
	 * @method observesAmPm
	 */
	observesAmPm: observer('meridian', function() {
		if (this.$() && this.$().length) {
			this.$('.am-pm-container > .button').removeClass('active');

			if(get(this, 'meridian') === 'AM') {
				this.$('.am-pm-container > .button.am').addClass('active');
			} else {
				this.$('.am-pm-container > .button.pm').addClass('active');
			}
		}
	}),

	getCurrentHour() {
		const time = _time(get(this, 'timestamp'));
		let hour = time.hour();
		if (get(this, 'meridian') === 'PM') {
			hour = time.hour() - 12;
		}

		if (hour === 0) {
			hour = 12;
		}

		return hour;
	},

	getCurrentMinute() {
		const time = _time(get(this, 'timestamp'));
		return time.minute();
	},

	getCurrentTimeByType(type) {
		if (type === kHourFlag) {
			return this.getCurrentHour();
		} else if (type === kMinuteFlag) {
			return this.getCurrentMinute();
		} else {
			assert(`Invalid type [${type}] passed to removeClockTime, valid types are ${kHourFlag} and ${kMinuteFlag}`, false);
		}
	},

	minMaxHandler(type /*, rangeStart, rangeEnd */) {
		const el = this.$();
		if (el && el.length) {
			const clock = metaFor(this, type);
			clock.each(point => {
				//for (let time=rangeStart; time<=rangeEnd; time++) {
				clock.enablePlot(point.num);

				const date = this.getDateFromTime(type, point.num);
				const bounds = _time.isDateInBounds(date, get(this, 'minDate'), get(this, 'maxDate'));
				if (bounds.isBefore || bounds.isAfter) {
					clock.disablePlot(point.num);
				}
			});
		}
	},

	resetTimeElements(type, min, max) {
		this.$().removeClass(kHourFlag);
		this.$().removeClass(kMinuteFlag);

		// switch active header
		this.$().addClass(type);

		this.setupCircles(type, min, max);
		this.removeClockTime(type, min, max);

		const time = this.getCurrentTimeByType(type);
		if (get(this, 'lastActive') !== time) {
			set(this, 'lastActive', time);
			this.setTimestamp(type, time);
		}
	},

	/**
	 * remove initial circles and lines for clock
	 *
	 * @private
	 * @method removeClockTime
	 * @param type {string}
	 * @param rangeStart {number}
	 * @param rangeEnd {number}
	 */
	removeClockTime(type /*, rangeStart, rangeEnd */) {
		const el = this.$();
		if (el && el.length) {
			const clock = metaFor(this, type);

			clock.each(p => {
				clock.unselectPlot(p.num);
			});

			if (type === kHourFlag) {
				this.minMaxHandler(kHourFlag, kHourMin, kHourMax);
			} else if (type === kMinuteFlag) {
				this.minMaxHandler(kMinuteFlag, kMinuteMin, kMinuteMax);
			} else {
				assert(`Invalid type [${type}] passed to removeClockTime, valid types are ${kHourFlag} and ${kMinuteFlag}`, false);
			}
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
		if (!get(this, 'isDestroyed')) {
			const el = this.$();
			if (el && el.length) {
				const clock = metaFor(this, type);

				const lastActive = get(this, `lastActive`);
				if (!isNone(lastActive)) {
					clock.unselectPlot(lastActive);
				}

				const value = this.getCurrentTimeByType(type);
				clock.selectPlot(value);

				console.log('setActiveTime', lastActive, value);

				set(this, `lastActive`, value);
				this.newDrag(type, value);
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
			const bounds = _time.isDateInBounds(date, get(this, 'minDate'), get(this, 'maxDate'));
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
		const total = type === kHourFlag ? 12 : 60;
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
		const total = type === kHourFlag ? kHourMax : kMinuteMax;
		let result = (degree * total) / 360;
		if (type === kMinuteFlag) {
			const upResult = Math.ceil(result);
			const downResult = Math.floor(result);

			if ((upResult%5) === 0) {
				result = upResult;
			} else if ((downResult%5) === 0) {
				result = downResult;
			}
		}
		return Math.round(result);
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
		if (!get(this, 'isDestroyed')) {
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
		const time = this.getDateFromTime(type, value);
		this.saveTimestamp(time);
		this.setActiveTime(type);
	},

	getDateFromTime(type, value) {
		const time = _time(get(this, 'timestamp'));

		if (type === kHourFlag) {
			if (value === 12) {
				value = 0;
			}

			if (get(this, 'meridian') === 'PM') {
				value = value + 12;
			}

			time.hour(value);
		} else if (type === kMinuteFlag) {
			time.minute(value);
		} else {
			assert(`Invalid type [${type}] passed to setTimestamp, valid types are ${kHourFlag} and ${kMinuteFlag}`, false);
		}
		return time;
	},

	setupCircles(type, start, end) {
		const clock = metaFor(this, type);
		const height = clock.container.height();
		const width = clock.container.width();
		const centerX = width/2;
		const centerY = height/2;
		const radius = centerX;
		const timeRadius = type === 'hours' ? radius*0.14 : radius*0.12;
		const clockPadding = width * 0.0306;

		const snap = clock.snap();
		const { svg, face, pivot } = snap;

		svg.attr({viewBox: `0 0 ${width} ${height}`});
		face.attr({cx: centerX, cy: centerY, r: radius});
		pivot.attr({cx: centerX, cy: centerY, r: (radius*0.0283)});

		for (let i=start; i<=end; i++) {
			const { arm, plot, path, text } = snap.at(i);

			// bbox width - the padding inside which is 2 times the x value then divide
			// that by two for the radius and finally subtract an amount of desired padding for looks.
			//const lineLength = (( ( bbox.width - ( bbox.x * 2 ) ) / 2 ) - clockPadding );
			const lineLength = (radius - timeRadius) - clockPadding;

			// get the degree for the time
			const degree = this.getDegree(type, i);
			const { x, y } = this.getPointFromAngle(degree, lineLength, centerX, centerY);

			// calculate line coords
			arm.attr({x1: x, y1: y, x2: centerY, y2: centerX});

			// calculate circle coords
			plot.attr({cx: x, cy: y, r: timeRadius});

			// calculate text position if there is a text
			// at this number
			if (!isNone(text)) {
				const bounds = text.node.getBBox();
				const nx = (x - (bounds.width/2));
				const ny = (y + (bounds.height/3));

				text.attr('transform', `translate(${nx}, ${ny})`);
			}

			// calculate section position for click areas on minutes
			if (!isNone(path)) {
				const tLength = radius;
				const bLength = lineLength - (timeRadius*2);

				const places = type === kHourFlag ? 12 : 60;
				const space = ((360/places)/2);

				const lDegree = ((degree - space) + 360) % 360; // get the angle for the left bounds
				const rDegree = (degree + space) % 360; // get the angle for the right bounds

				// get the bottom left and right points
				const lp = this.getPointFromAngle(lDegree, bLength, centerX, centerY);
				const rp = this.getPointFromAngle(rDegree, bLength, centerX, centerY);

				// get the top left and right points
				const lph = this.getPointFromAngle(lDegree, tLength, centerX, centerY);
				const rph = this.getPointFromAngle(rDegree, tLength, centerX, centerY);

				// get the point to curve the top bar to.
				const bp = this.getPointFromAngle(degree, tLength, centerX, centerY);

				// build the path string
				path.attr({d: `M${lph.x} ${lph.y} Q ${bp.x} ${bp.y} ${rph.x} ${rph.y} L ${rp.x} ${rp.y} ${lp.x} ${lp.y} Z`});
			}
		}
	},

	getPointFromAngle(degree, length, x1, y1) {
		// getPointFromAngle will calculate all angles according to the positive x axis
		// so rotate all degrees by 270 to get the proper alignment of time per degree on the clock
		degree = (degree + 270) % 360;

		// convert degrees to radians
		let rads = Snap.rad(degree);

		// calculate x and y
		let x = x1 + length * Math.cos(rads);
		let y = y1 + length * Math.sin(rads);

		return { x, y };
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
		if (!get(this, 'isDestroyed')) {
			const target = this;
			const clock = metaFor(this, type);
			const snap = clock.snap();
			const { svg, face } = snap;
			const { text, arm, plot } = snap.at(value);

			const centerX = parseFloat(face.attr('cx'));
			const centerY = parseFloat(face.attr('cy'));

			const startAngle = this.getDegree(type, value);
			let endAngle = startAngle;

			const startX = parseFloat(plot.attr('cx'));
			const startY = parseFloat(plot.attr('cy'));

			/**
			 * allows for the hours group to start being dragged
			 */
			const start = function() {
				this.data('origTransform', this.transform().local);
				if (!isNone(text)) {
					text.remove();
					text.appendTo(svg);
					text.removeClass('interior-white');
				}
			};

			/**
			 * moves the dial on the hour clock while transforming group
			 */
			const move = function(dx, dy) {
				const nx = startX + dx;
				const ny = startY + dy;

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
				target.setTimeForDegree(type, endAngle);

				// notify listeners an update has occured
				target.sendAction('onUpdate', type, get(target, 'timestamp'));
			};

			if (!isNone(get(this, 'lastGroup'))) {
				const undragPrevious = get(this, 'lastGroup');
				undragPrevious.undrag();
			}

			const typeArray = [arm, plot];
			if (!isNone(text)) {
				typeArray.push(text);
			}

			const curGroup = svg.g.apply(svg, typeArray);
			curGroup.drag(move, start, stop);

			set(this, 'lastGroup', curGroup);
		}
	},

	actions: {
		clickHours(hour) {
			// set time and remove last active
			this.setTimestamp(kHourFlag, hour);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', kHourFlag, get(this, 'timestamp'));
		},

		clickMinutes(minute) {
			if (get(this, 'lastActive') !== minute) {
				// set time and remove last active
				this.setTimestamp(kMinuteFlag, minute);

				// notify event listeners that an update has occurred
				this.sendAction('onUpdate', kMinuteFlag, get(this, 'timestamp'));
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
			hour = stringToInteger(hour);

			// set time and remove last active
			this.setTimestamp(kHourFlag, hour);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', kHourFlag, get(this, 'timestamp'));
		},

		/**
		 * handles clicking on minutes
		 *
		 * @param minute {string} minute clicked on clock
		 * @event minuteClicked
		 */
		minuteClicked(minute) {
			// convert minute to integer
			minute = stringToInteger(minute);

			// set time and remove last active
			this.setTimestamp(kMinuteFlag, minute);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', kMinuteFlag, get(this, 'timestamp'));
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
				const flag = get(this, 'isHourPicker') ? kHourFlag : kMinuteFlag;
				this.sendAction('onUpdate', flag, get(this, 'timestamp'));
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
			this.sendAction('onUpdate', kHourFlag, get(this, 'timestamp'));
		},

		/**
		 * handles clicking the minute in the header
		 *
		 * @event minuteHeaderClicked
		 */
		minuteHeaderClicked() {
			set(this, 'isHourPicker', false);

			// notify event listeners that an update has occurred
			this.sendAction('onUpdate', kMinuteFlag, get(this, 'timestamp'));
		}
	}
});

