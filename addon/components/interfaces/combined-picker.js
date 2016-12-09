/**
 * @module Components
 *
 */
import Ember from 'ember';
import moment from 'moment';
import layout from '../../templates/components/interfaces/combined-picker';
import Assert from 'busy-utils/assert';

/**
 * `Component/CompinedPicker`
 *
 * @class CombinedPicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({

  /**
   * @private
   * @property classNames
   * @type String
   * @default combined-picker
   */
  classNames: ['combined-picker'],
  layout: layout,

	paperDate: null,
	paperCalendar: null,

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
  currentDate: null,

  /**
   * String as the current time of the timestamp
   *
   * @private
   * @property currentTime
   * @type String
   */
  currentTime: null,

  /**
   * if they cancel the change this is the timestamp the picker will revert back to
   *
   * @private
   * @property backupTimestamp
   * @type Number
   */
  backupTimestamp: null,

	activeState: null,

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
  initialize: Ember.on('init', function() {
		this.setupTime();
    this.observeActiveSection();
    this.observesDateTime();
    this.set('backupTimestamp', this.get('timestamp'));
	}),

	setupTime: Ember.observer('paperDate.timestamp', function() {
		this.set('timestamp', this.get('paperDate.timestamp'));
		this.set('minDate', this.get('paperDate.minDate'));
		this.set('maxDate', this.get('paperDate.maxDate'));
  }),

	bindListeners() {
    if (this.get('isClock') === true || this.get('isCalendar') === true) {
      const modal = Ember.$(document);
      const thisEl = this.$();
			const id = thisEl.attr('id');

      modal.bind(`click.paper-datetime-picker-${id}`, (evt) => {
        if (!this.get('isDestroyed')) {
          let el = Ember.$(evt.target);

          let elMain = el.parents('.paper-datetime-picker');
          let thisMain = thisEl.parents('.paper-datetime-picker');

          if (elMain.attr('id') !== thisMain.attr('id')) {
            if(el.attr('class') !== 'paper-datetime-picker' || el.parents('.paper-datetime-picker').length === 0) {
              if(!el.hasClass('keepOpen')) {
                if(this.get('isClock') === true || this.get('isCalendar') === true) {
									this.unbindListeners();
                  this.send('close');
                }
              }
            }
          }
        }
      });

      modal.bind(`keyup.paper-datetime-picker-${id}`, (e) => {
        if (!this.get('isDestroyed')) {
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
    let modal = Ember.$(document);
		const id = this.$().attr('id');
    modal.unbind(`click.paper-datetime-picker-${id}`);
    modal.unbind(`keyup.paper-datetime-picker-${id}`);
	},

  /**
   * sets up the click handler to close the dialogs if anything outside is clicked
   * @private
   * @method didInsertElement
   */
  //onOpen: Ember.on('didInsertElement', function() {
	//	this.unbindListeners();
	//	this.bindListeners();
	//}),

  /**
   * removes the click handler to close the dialogs if anything outside is clicked
   * @private
   * @method removeClick
   */
  onClose: Ember.on('willDestroyElement', function() {
		this.unbindListeners();
  }),

  /**
   * closes dialog if tabbed on last input
   *
   * @private
   * @method observeCloseOnTab
   */
	observeCloseOnTab: Ember.observer('activeState.isOpen', function() {
		if (this.get('activeState.isOpen')) {
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
  observeActiveSection: Ember.observer('activeState.state', function() {
    const state = this.get('activeState.state');
		if (!Ember.isNone(state)) {
			this.set('isClock', (state === 'hour' || state === 'minute' || state === 'meridian'));
			this.set('isCalendar', (state === 'year' || state === 'month' || state === 'day'));
		}
  }),

  /**
   * sets/resets currentDate whenever timestamp changes
   *
   * @private
   * @method observesCurrentDate
   */
  observesDateTime: Ember.observer('timestamp', function() {
    const time = this.getMomentDate(this.get('timestamp'));

    Ember.assert("timestamp must be a valid unix timestamp", Ember.isNone(this.get('timestamp')) || typeof this.get('timestamp') === 'number');

    if (!Ember.isNone(this.get('timestamp'))) {
      Assert.isMoment(time);
      if (!time.isValid()) {
        Assert.throw("timestamp must be a valid unix timestamp");
      }
    }

    this.set('currentDate', time.format('MMM DD, YYYY'));
    this.set('currentTime', time.format('hh:mm A'));
  }),

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

	actions: {

		update(focus, time) {
			this.sendAction('onUpdate', focus, time);
		},

		/**
     * changes dialog from clock to calendar and vice versa
     *
     * @event togglePicker
     */
		togglePicker(current) {
			const isClock = (current === 'isClock');
			const state = (isClock ? 'day' : 'hour');

			this.set('isClock', !isClock);
			this.set('isCalendar', isClock);
			this.set('activeState.state', state);

			this.sendAction('onUpdate', state, this.get('timestamp'));
		},

		/**
		 * closes all dialogs
		 *
		 * @event togglePicker
		 */
		close() {
			this.set('backupTimestamp', this.get('timestamp'));
			this.set('isClock', false);
			this.set('isCalendar', false);
			this.sendAction('onClose');
		},

		/**
     * closes all dialogs and resets the timestamp
     *
     * @event togglePicker
     */
		cancel() {
			this.set('timestamp', this.get('backupTimestamp'));
			this.set('isClock', false);
			this.set('isCalendar', false);
			this.sendAction('onClose');
		},

		onHeaderSelect(type) {
			this.set('activeState.state', type);
			this.sendAction('onUpdate', type, this.get('timestamp'));
		},
	}
});
