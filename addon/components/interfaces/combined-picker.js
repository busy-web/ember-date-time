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
   * string of the new active element on the picker
   *
   * @private
   * @property activeSection
   * @type string
   */
  activeSection: null,

  /**
   * if hour or minutes are active
   *
   * @private
   * @property isHourPicker
   * @type string
   */
  isHourPicker: true,

  /**
   * active input for calendar dialog
   *
   * @private
   * @property calendarActiveSection
   * @type string
   */
  calendarActiveSection: null,

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
  lastActiveSection: null,

  /**
   * variable that is changed in multiple places, used to keep timepicker from opening more than once
   *
   * @private
   * @property openOnce
   * @type Number
   */
  openOnce: 0,

  /**
   * observer value to close dialog on tab from last input field
   *
   * @private
   * @property closeOnTab
   * @type Boolean
   */
  closeOnTab: null,

  /**
  * can be passed in as true or false, true will have the picker only be a date picker
  *
  * @private
  * @property calenderOnly
  * @type boolean
  * @optional
  */
  calenderOnly: false,

  /**
  * can be passed in as true or false, true will have the picker only be a time picker
  *
  * @private
  * @property timepickerOnly
  * @type boolean
  * @optional
  */
  timepickerOnly: false,


  /**
   * sets currentTime and currentDate, sets a timestamp to now if a timestamp wasnt passed in
   * @private
   * @method init
   * @constructor
   */
  init() {
    this._super();
    this.observeActiveSection();
    this.observesDateTime();
    this.set('backupTimestamp', this.get('timestamp'));
  },

  /**
   * sets up the click handler to close the dialogs if anything outside is clicked
   * @private
   * @method didInsertElement
   */
  onOpen: Ember.on('didInsertElement', function() {
    if (this.get('isClock') === true || this.get('isCalendar') === true) {
      let modal = Ember.$(document);
      let thisEl = this.$();

      this.set('destroyElements', false);

      modal.bind('click.paper-datetime-picker', (evt) => {
        if (!this.get('isDestroyed')) {
          let el = Ember.$(evt.target);

          let elMain = el.parents('.paper-datetime-picker');
          let thisMain = thisEl.parents('.paper-datetime-picker');

          if (elMain.attr('id') !== thisMain.attr('id')) {
            if(el.attr('class') !== 'paper-datetime-picker' || el.parents('.paper-datetime-picker').length === 0) {
              if(!el.hasClass('keepOpen')) {
                if(this.get('isClock') === true || this.get('isCalendar') === true) {
                  this.set('destroyElements', true);
                  this.send('close');
                }
              }
            }
          }
        }
      });

      modal.bind('keyup.paper-datetime-picker', (e) => {
        if (!this.get('isDestroyed')) {
          let key = e.which;
          if (key === 27) {
            this.set('destroyElements', true);
            this.send('cancel');
          } else if (key === 13) {
            this.set('destroyElements', true);
            this.send('close');
          }
        }
      });
    }
  }),

  /**
   * removes the click handler to close the dialogs if anything outside is clicked
   * @private
   * @method removeClick
   */
  onClose: Ember.on('willDestroyElement', function() {
    let modal = Ember.$(document);
    modal.unbind('click.paper-datetime-picker');
    modal.unbind('keyup.paper-datetime-picker');
  }),

  /**
   * opens/closes the correct dialogs based on the inputs clicked on/ focused on
   *
   * @private
   * @method observeActiveSection
   */
  observeActiveSection: Ember.observer('updateActive', function() {
    const section = this.get('activeSection');
    if (section !== this.get('lastActiveSection')) {
      this.set('openOnce', 0);
    }

    if (this.get('isClock') === false && this.get('isCalendar') === false) {
      this.set('openOnce', 0);
    }

    if (section !== this.get('lastActiveSection') || this.get('openOnce') < 1) {
      if (section === 'year' || section === 'month' || section === 'day') {
        this.set('isClock', false);
        this.set('isCalendar', true);
      } else if (section === 'hour' || section === 'meridean') {
        this.set('isClock', true);
        this.set('isHourPicker', true);
        this.set('isCalendar', false);
      } else if (section === 'minute') {
        this.set('isClock', true);
        this.set('isHourPicker', false);
        this.set('isCalendar', false);
      }

      this.set('lastActiveSection', section);
      this.set('openOnce', this.get('openOnce') + 1);
    }
  }),

  /**
   * refreshes calendarActiveSection
   *
   * @private
   * @method refreshCalendarActiveSection
   */
  refreshCalendarActiveSection: Ember.observer('updateActive', function() {
    this.set('calendarActiveSection', this.get('activeSection'));
  }),

  /**
   * closes dialog if tabbed on last input
   *
   * @private
   * @method observeCloseOnTab
   */
  observeCloseOnTab: Ember.observer('closeOnTab', function() {
    if (this.get('closeOnTab') === true) {
      this.set('destroyElements', true);
      this.send('close');
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

		/**
     * changes dialog from clock to calendar and vice versa
     *
     * @event togglePicker
     */
		togglePicker(current) {
			const isClock = (current === 'isClock');

			this.set('isClock', !isClock);
			this.set('isCalendar', isClock);
			this.set('openOnce', 0);
			this.set('isHourPicker', true);

			this.sendAction('dateTypeChange', (isClock ? 'day' : 'hour'));
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
			this.set('openOnce', 0);
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
			this.set('openOnce', 0);
			this.sendAction('onClose');
		},

		onHeaderSelect(type) {
			this.set('isHourPicker', (type === 'hours'));
			this.sendAction('dateTypeChange', type);
		},
	}
});
