/**
 * @module Components
 *
 */
import Component from '@ember/component';
import { get, set, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { isNone } from '@ember/utils';
import { assert } from '@ember/debug';
//import { Snap } from 'snapsvg';
import _time from '@busy-web/ember-date-time/utils/time';
import _clock from '@busy-web/ember-date-time/utils/clock';
import layout from '../../templates/components/private/svg-clock';

/**
 * `Component/Private/SVGClock`
 *
 * @class SVGClock
 * @extends Component
 * @namespace Component.Private
 */
export default Component.extend({
  layout,
	classNames: ['busyweb', 'emberdatetime', 'p-svg-clock'],

	/**
	 * type for the clock, minute or hour
	 *
	 * @property type
	 * @type string
	 */
	type: '',

	/**
	 * Represents the number of points to render numbers at.
	 * This must be a multiple of 360 with a min value of 12 and a max value of 60
	 *
	 * @property min
	 * @type number
	 * @default 12
	 */
	visibleNum: 12,

	/**
	 * Represents the number of points to register click events at.
	 * This must be a multiple of 360 with a min value of 12 and a max value of 60
	 * This must also be greater than or equal to minPoints.
	 *
	 * @property max
	 * @type number
	 * @default 12
	 */
	clickableNum: 12,

	/**
	 * The view box coordinates. This must be an array of integers for [ top, left, bottom, right ]
	 *
	 * @property viewBox
	 * @type number[]
	 */
	viewBox: null,

	timestamp: null,
	minDate: null,
	maxDate: null,

	__data: null,

	/**
	 * initialize method
	 *
	 * @private
	 * @method setup
	 */
	setup: on('init', function() {
		if (!isNone(get(this, 'timestamp'))) {
			set(this, '__timestamp', get(this, 'timestamp'));
		}

		assert('visibleNum must be a number from 2 - 12 and must be divisible by 2', typeof get(this, 'visibleNum') === 'number' && (get(this, 'visibleNum') % 2) === 0);
		assert('clickableNum must be a number from 2 - 60 and must be divisible by 2', typeof get(this, 'clickableNum') === 'number' && (get(this, 'clickableNum') % 2) === 0);
	}),

	afterRender: on('didInsertElement', function() {
		this.renderClock();
	}),

	timestampChanged: observer('timestamp', function() {
		let oldStamp = get(this, '__timestamp');
		set(this, '__timestamp', get(this, 'timestamp'));

		// component has not rendered yet so dont prerender it here
		if (!isNone(oldStamp)) {
			this.renderClock();
		}
	}),

	renderClock() {
		let type = get(this, 'type');
		type = type.charAt(0);

		let data = {
			type,
			title: type === 'm' ? 'minutes' : 'hours',
			visibleNum: get(this, 'visibleNum'),
			clickableNum: get(this, 'clickableNum'),
			viewBox: get(this, 'viewBox'),
			timestamp: get(this, '__timestamp'),
			minDate: get(this, 'minDate'),
			maxDate: get(this, 'maxDate')
		};
		set(this, '__clock', _clock(this, data));
	},

	setSelected(num) {
		get(this, '__data.points').forEach(p => {
			set(p, 'selected', get(p, 'num') === num);
		});
	},

	clickHandler(point) {
		let num = get(point, 'num');
		let time = _time(get(this, '__timestamp'));
		if (get(point, 'type') === 'h') {
			time.hour(num);
		} else {
			time.minute(num);
		}
		set(this, '__timestamp', time.timestamp());
		this.renderClock();
		//this.sendAction('onclick', get(this, '__timestamp'));
	},

	actions: {
		clickAction(point) {
			this.setSelected(get(point, 'num'));
			this.sendAction('onclick', get(point, 'num'), get(point, 'value'));
		}
	}
});
