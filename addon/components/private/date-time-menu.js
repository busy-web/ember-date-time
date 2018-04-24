/**
 * @module Components
 *
 */
import Component from '@ember/component';
import $ from 'jquery';
import { get, set, computed, observer } from '@ember/object';
import { isEmpty } from '@ember/utils';
import _time from '@busy-web/ember-date-time/utils/time';
import { bind, unbind } from '@busy-web/ember-date-time/utils/event';
import {
	YEAR_FLAG,
	MONTH_FLAG,
	WEEKDAY_FLAG,
	DAY_FLAG,
	HOUR_FLAG,
	MINUTE_FLAG,
	MERIDIAN_FLAG
} from '@busy-web/ember-date-time/utils/constant';
import layout from '../../templates/components/private/date-time-menu';

/**
 * `Component/CompinedPicker`
 *
 * @class CombinedPicker
 * @namespace Components
 * @extends Component
 */
export default Component.extend({

  /**
   * @private
   * @property classNames
   * @type String
   * @default combined-picker
   */
  classNames: ['busyweb', 'emberdatetime', 'p-date-time-menu'],
  layout: layout,

	stateManager: null,

  /**
   * timestamp that is passed in when using combined-picker
   *
   * @private
   * @property timestamp
   * @type Number
   */
  timestamp: null,

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
   * can be passed in so a date after the maxDate cannot be selected
   *
   * @private
   * @property maxDate
   * @type Number
   * @optional
   */
  maxDate: null,

  /**
   * can be passed in as true or false, true sets timepicker to handle unix timestamp * 1000, false sets it to handle unix timestamp
   *
   * @private
   * @property isMilliseconds
   * @type boolean
   * @optional
   */
  isMilliseconds: null,

  /**
   * String as the current date of the timestamp
   *
   * @private
   * @property currentDate
   * @type String
   */
  currentDate: computed('timestamp', function() {
		return _time(get(this, 'timestamp')).format('MMM DD, YYYY');
	}).readOnly(),

  /**
   * String as the current time of the timestamp
   *
   * @private
   * @property currentTime
   * @type String
   */
  currentTime: computed('timestamp', function() {
		return _time(get(this, 'timestamp')).format('hh:mm A');
	}).readOnly(),

  /**
   * if they cancel the change this is the timestamp the picker will revert back to
   *
   * @private
   * @property backupTimestamp
   * @type Number
   */
  backupTimestamp: null,

  /**
   * the last active section that was open in the pickers
   *
   * @private
   * @property lastActiveSection
   * @type String
   */
  lastActiveState: null,

  /**
   * sets currentTime and currentDate, sets a timestamp to now if a timestamp wasnt passed in
   * @private
   * @method init
   * @constructor
   */
	init(...args) {
		this._super(...args);

		this.setupTime();
	},

	setupTime: observer('stateManager.timestamp', function() {
		if (!this.get('isDestroyed')) {
			set(this, 'minDate', get(this, 'stateManager.minDate'));
			set(this, 'maxDate', get(this, 'stateManager.maxDate'));
			set(this, 'timestamp', get(this, 'stateManager.timestamp'));
			set(this, 'backupTimestamp', get(this, 'timestamp'));
		}
  }),

	/**
	 * binds a click event that will call the provided
	 * action anytime a click occurs not within the component
	 *
	 * NOTE:
	 * The action name provided will get called everytime a click occurs so the
	 * action should only handle on thing like closing a drop down vs toggling a dropdown.
	 * this will prevent accidently opening the dialog when it is closed and a click occurs.
	 *
	 * @public
	 * @method bindClick
	 * @return {void}
	 */
	bindClick() {
		// save this for later
		const _this = this;

		// get the components elementId
		let elementId = get(this, 'elementId');

		// make sure an elementId exists on the class
		// using this mixin
		if (!isEmpty(elementId)) {
			// bind the click listener
			bind(document, 'click', elementId, function(evt) {
				// get the element that was clicked on
				const el = $(evt.target);

				// if the clicked element id does not match the components id and the clicked
				// elements parents dont have an id that matches then call the action provided
				if (el.attr('id') !== elementId && el.parents(`#${elementId}`).length === 0) {
					// send a call to the actionName
					evt.stopPropagation();
					evt.preventDefault();

					// call handler
					_this.unbindClick();
					_this.send('close');
					return false;
				}
			}, { capture: true, rebind: true });
		}
	},

	bindKeyup() {
		// save this for later
		const _this = this;

		// get the components elementId
		let elementId = get(this, 'elementId');

		// make sure an elementId exists on the class
		// using this mixin
		if (!isEmpty(elementId)) {
			bind(document, 'keyup', elementId, function(evt) {
				let key = evt.which;
				if (key === 27) {
					_this.closeHandler('cancel');
				} else if (key === 13) {
					_this.closeHandler('close');
				}
			}, { capture: true, rebind: true });
		}
	},

	/**
	 * method to unbind a click event that may have been
	 * setup by this components
	 *
	 * @public
	 * @method unbindClick
	 */
	unbindClick() {
		// get the components elementId
		let elementId = get(this, 'elementId');

		// make sure an elementId exists on the class
		// using this mixin
		if (!isEmpty(elementId)) {
			// unbind any previous click listeners
			unbind(document, 'click', elementId);
		}
	},

	unbindKeyup() {
		// get the components elementId
		let elementId = get(this, 'elementId');

		// make sure an elementId exists on the class
		// using this mixin
		if (!isEmpty(elementId)) {
			// unbind any previous click listeners
			unbind(document, 'keyup', elementId);
		}
	},

  /**
   * sets up the click handler to close the dialogs if anything outside is clicked
   * @private
   * @method didInsertElement
   */
	didInsertElement(...args) {
		this._super(...args);

		this.bindHandler();
	},

  /**
   * removes the click handler to close the dialogs if anything outside is clicked
   * @private
   * @method removeClick
   */
	willDestroyElement(...args) {
		this._super(...args);

		this.closeHandler();
  },

  /**
   * closes dialog if tabbed on last input
   *
   * @private
   * @method observeCloseOnTab
   */
	observeCloseOnTab: observer('stateManager.isOpen', function() {
		if (get(this, 'stateManager.isOpen')) {
			this.bindHandler();
		} else {
			this.closeHandler();
		}
	}),

	isClock: computed('stateManager.section', function() {
		let section = get(this, 'stateManager.section');
		return (section === HOUR_FLAG || section === MINUTE_FLAG || section === MERIDIAN_FLAG);
	}),

	isCalendar: computed('stateManager.section', function() {
		let section = get(this, 'stateManager.section');
		return (section === YEAR_FLAG || section === MONTH_FLAG || section === DAY_FLAG || section === WEEKDAY_FLAG);
	}),

	bindHandler() {
		this.bindClick();
		this.bindKeyup();
	},

	closeHandler(type) {
		this.unbindClick();
		this.unbindKeyup();
		if (!isEmpty(type)) {
			this.send(type);
		}
	},

	actions: {
		update(focus, time, calendar) {
			this.sendAction('onUpdate', focus, time, calendar);
		},

		change(focus, time, calendar) {
			this.sendAction('onChange', focus, time, calendar);
		},

		/**
     * changes dialog from clock to calendar and vice versa
     *
     * @event togglePicker
     */
		togglePicker() {
			let section = HOUR_FLAG;
			if (get(this, 'isClock')) {
				section = DAY_FLAG;
			}
			this.sendAction('onUpdate', section, get(this, 'timestamp'));
		},

		/**
		 * closes all dialogs
		 *
		 * @event togglePicker
		 */
		close() {
			if (!get(this, 'isDestroyed')) {
				set(this, 'backupTimestamp', get(this, 'timestamp'));
			}
			this.sendAction('onClose');
		},

		/**
     * closes all dialogs and resets the timestamp
     *
     * @event togglePicker
     */
		cancel() {
			if (!get(this, 'isDestroyed')) {
				set(this, 'timestamp', get(this, 'backupTimestamp'));
			}
			this.sendAction('onClose');
		},

		onHeaderSelect(type) {
			//if (!get(this, 'isDestroyed')) {
			//	set(this, 'stateManager.section', type);
			//}
			this.sendAction('onUpdate', type, get(this, 'timestamp'));
		}
	}
});
