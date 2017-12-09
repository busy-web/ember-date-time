/**
 * @module Components
 *
 */
import Component from '@ember/component';
import $ from 'jquery';
import { isNone } from '@ember/utils';
import { on } from '@ember/object/evented';
import { get, set, computed, observer } from '@ember/object';
import _time from '@busy-web/ember-date-time/utils/time';
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

	activeState: null,

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
   * boolean based on if the clock or calendar is showing
   *
   * @private
   * @property isClockHour
   * @type Boolean
   */
  isClock: false,

  /**
   * boolean based on if the clock or calendar is showing
   *
   * @private
   * @property isCalendar
   * @type Boolean
   */
  isCalendar: true,

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
  initialize: on('init', function() {
		this.setupTime();
    this.observeActiveSection();
    set(this, 'backupTimestamp', get(this, 'timestamp'));
	}),

	setupTime: observer('activeState.timestamp', function() {
		set(this, 'minDate', get(this, 'activeState.minDate'));
		set(this, 'maxDate', get(this, 'activeState.maxDate'));
		set(this, 'timestamp', get(this, 'activeState.timestamp'));
  }),

	bindListeners() {
    if (get(this, 'isClock') === true || get(this, 'isCalendar') === true) {
      const modal = $(document);
      const thisEl = this.$();
			const id = thisEl.attr('id');

      modal.bind(`click.c-date-time-picker-${id}`, (evt) => {
        if (!get(this, 'isDestroyed')) {
          let el = $(evt.target);

          let elMain = el.parents('.c-date-time-picker');
          let thisMain = thisEl.parents('.c-date-time-picker');

          if (elMain.attr('id') !== thisMain.attr('id')) {
            if(el.attr('class') !== 'c-date-time-picker' || el.parents('.c-date-time-picker').length === 0) {
              if(!el.hasClass('keepOpen')) {
                if(get(this, 'isClock') === true || get(this, 'isCalendar') === true) {
									this.unbindListeners();
                  this.send('close');
                }
              }
            }
          }
        }
      });

      modal.bind(`keyup.c-date-time-picker-${id}`, (e) => {
        if (!get(this, 'isDestroyed')) {
          let key = e.which;
          if (key === 27) {
						this.unbindListeners();
            this.send('cancel');
          } else if (key === 13) {
						this.unbindListeners();
            this.send('close');
          }
        }
      });
    }
  },

	unbindListeners() {
    let modal = $(document);
		const id = this.$().attr('id');
    modal.unbind(`click.c-date-time-picker-${id}`);
    modal.unbind(`keyup.c-date-time-picker-${id}`);
	},

  /**
   * sets up the click handler to close the dialogs if anything outside is clicked
   * @private
   * @method didInsertElement
   */
  onOpen: on('didInsertElement', function() {
		this.unbindListeners();
		this.bindListeners();
	}),

  /**
   * removes the click handler to close the dialogs if anything outside is clicked
   * @private
   * @method removeClick
   */
  onClose: on('willDestroyElement', function() {
		this.unbindListeners();
  }),

  /**
   * closes dialog if tabbed on last input
   *
   * @private
   * @method observeCloseOnTab
   */
	observeCloseOnTab: observer('activeState.isOpen', function() {
		if (get(this, 'activeState.isOpen')) {
			this.unbindListeners();
			this.bindListeners();
		} else {
			this.unbindListeners();
		}
	}),

  /**
   * opens/closes the correct dialogs based on the inputs clicked on/ focused on
   *
   * @private
   * @method observeActiveSection
   */
  observeActiveSection: observer('activeState.section', function() {
    const section = get(this, 'activeState.section');
		if (!isNone(section)) {
			set(this, 'isClock', (section === 'hours' || section === 'minutes' || section === 'meridian'));
			set(this, 'isCalendar', (section === 'years' || section === 'months' || section === 'days'));
		}
  }),

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
		togglePicker(current) {
			const isClock = (current === 'isClock');
			const section = (isClock ? 'days' : 'hours');

			//set(this, 'isClock', !isClock);
			//set(this, 'isCalendar', isClock);
			//set(this, 'activeState.section', section);

			this.sendAction('onUpdate', section, get(this, 'timestamp'));
		},

		/**
		 * closes all dialogs
		 *
		 * @event togglePicker
		 */
		close() {
			set(this, 'backupTimestamp', get(this, 'timestamp'));
			//set(this, 'isClock', false);
			//set(this, 'isCalendar', false);
			this.sendAction('onClose');
		},

		/**
     * closes all dialogs and resets the timestamp
     *
     * @event togglePicker
     */
		cancel() {
			set(this, 'timestamp', get(this, 'backupTimestamp'));
			//set(this, 'isClock', false);
			//set(this, 'isCalendar', false);
			this.sendAction('onClose');
		},

		onHeaderSelect(type) {
			//set(this, 'activeState.section', type);
			this.sendAction('onUpdate', type, get(this, 'timestamp'));
		}
	}
});
