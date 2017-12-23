/**
 * @module Components
 *
 */
import Component from '@ember/component';
import $ from 'jquery';
//import { isNone } from '@ember/utils';
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
  initialize: on('init', function() {
		this.setupTime();
	}),

	setupTime: observer('stateManager.timestamp', function() {
		set(this, 'minDate', get(this, 'stateManager.minDate'));
		set(this, 'maxDate', get(this, 'stateManager.maxDate'));
		set(this, 'timestamp', get(this, 'stateManager.timestamp'));
    set(this, 'backupTimestamp', get(this, 'timestamp'));
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
	observeCloseOnTab: observer('stateManager.isOpen', function() {
		if (get(this, 'stateManager.isOpen')) {
			this.unbindListeners();
			this.bindListeners();
		} else {
			this.unbindListeners();
		}
	}),

	isClock: computed('stateManager.section', function() {
		let section = get(this, 'stateManager.section');
		return (section === 'hours' || section === 'minutes' || section === 'meridian');
	}),

	isCalendar: computed('stateManager.section', function() {
		let section = get(this, 'stateManager.section');
		return (section === 'years' || section === 'months' || section === 'days');
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
		togglePicker() {
			let section = 'hours';
			if (get(this, 'isClock')) {
				section = 'days';
			}
			this.sendAction('onUpdate', section, get(this, 'timestamp'));
		},

		/**
		 * closes all dialogs
		 *
		 * @event togglePicker
		 */
		close() {
			set(this, 'backupTimestamp', get(this, 'timestamp'));
			this.sendAction('onClose');
		},

		/**
     * closes all dialogs and resets the timestamp
     *
     * @event togglePicker
     */
		cancel() {
			set(this, 'timestamp', get(this, 'backupTimestamp'));
			this.sendAction('onClose');
		},

		onHeaderSelect(type) {
			//set(this, 'stateManager.section', type);
			this.sendAction('onUpdate', type, get(this, 'timestamp'));
		}
	}
});
