/**
 * @module Components
 *
 */
import Ember from 'ember';
import moment from 'moment';
import layout from '../../templates/components/interfaces/combined-picker';

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
   * boolean based on if the clock or calender is showing
   *
   * @private
   * @property isClockHour
   * @type Boolean
   */
  isClock: true,

  /**
   * boolean based on if the clock or calender is showing
   *
   * @private
   * @property isCalender
   * @type Boolean
   */
  isCalender: false,

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
   * @property minuteOrHour
   * @type string
   */
  minuteOrHour: null,

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
   * sets currentTime and currentDate, sets a timestamp to now if a timestamp wasnt passed in
   * @private
   * @method init
   * @constructor
   */
  init: function()
  {
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
  onOpen: Ember.on('didInsertElement', function()
  {
    if (this.get('isClock') === true || this.get('isCalender') === true)
    {
      let _this = this;

      let modal = Ember.$(document);

      modal.bind('click.paper-datetime-picker', (evt) => {

        var el = Ember.$(evt.target);

        if(el.attr('class') === 'paper-datetime-picker' || el.parents('.paper-datetime-picker').length === 0)
        {
          if(!el.hasClass('keepOpen'))
          {
            if(_this.get('isClock') === true || _this.get('isCalender') === true)
            {
              _this.set('destroyElements', true);
              _this.send('close');
            }
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
  onClose: Ember.on('willDestroyElement', function()
  {
    let modal = Ember.$(document);
    modal.unbind('click.paper-datetime-picker');
  }),

  /**
   * opens/closes the correct dialogs based on the inputs clicked on/ focused on
   *
   * @private
   * @method observeActiveSection
   */
  observeActiveSection: Ember.observer('updateActive', function()
  {
    const section = this.get('activeSection');

    if (section !== this.get('lastActiveSection'))
    {
      this.set('openOnce', 0);
    }
    if (this.get('isClock') === false && this.get('isCalender') === false)
    {
      this.set('openOnce', 0);
    }

    if (section !== this.get('lastActiveSection') || this.get('openOnce') < 1)
    {
      if (section === 'year' || section === 'month' || section === 'day')
      {
        this.set('isClock', false);
        this.set('isCalender', true);
      }
      if (section === 'hour' || section === 'meridean')
      {
        this.set('isClock', true);
        this.set('minuteOrHour', 'hour');
        this.set('isCalender', false);
      }
      if (section === 'minute')
      {
        this.set('isClock', true);
        this.set('minuteOrHour', 'minute');
        this.set('isCalender', false);
      }

      this.set('lastActiveSection', section);
      this.set('openOnce', this.get('openOnce') + 1);
    }

    this.changeDialogHeight();
  }),

  /**
   * sets/resets currentDate whenever timestamp changes
   *
   * @private
   * @method observesCurrentDate
   */
  observesDateTime: Ember.observer('timestamp', function()
  {
    Ember.assert("timestamp must be a valid unix timestamp", Ember.isNone(this.get('timestamp')) || typeof this.get('timestamp') === 'number');

    let time = moment();

    if (!Ember.isNone(this.get('timestamp'))) {

      time = moment(this.get('timestamp'));
      Ember.assert("timestamp must be a valid unix timestamp", moment.isMoment(time) && time.isValid());
    }

    this.set('currentDate', time.format('MMM DD, YYYY'));
    this.set('currentTime', time.format('hh:mm A'));
  }),

  /**
   * sets the correct classes depending on which section is active
   *
   * @private
   * @method changeDialogHeight
   */
  changeDialogHeight: function()
  {
    const isClock = this.get('isClock');
    if (isClock)
    {
      Ember.$('.bottom-dialog-container').removeClass('calHeight');
      Ember.$('.top-dialog-container').removeClass('calHeight');

      Ember.$('.bottom-dialog-container').addClass('timeHeight');
      Ember.$('.top-dialog-container').addClass('timeHeight');
    }

    if (!isClock)
    {
      Ember.$('.bottom-dialog-container').removeClass('timeHeight');
      Ember.$('.top-dialog-container').removeClass('timeHeight');

      Ember.$('.bottom-dialog-container').addClass('calHeight');
      Ember.$('.top-dialog-container').addClass('calHeight');
    }
  },

  /**
   * completely removes the pickers containers
   *
   * @private
   * @method removeContainer
   */
  removeContainer: function()
  {
    Ember.$('.bottom-dialog-container').addClass('removeDisplay');
    Ember.$('.top-dialog-container').addClass('removeDisplay');
  },

  actions: {

    /**
     * changes dialog from clock to calender and vice versa
     *
     * @event togglePicker
     */
    togglePicker: function(current)
    {
     const isClock = (current === 'isClock');
     this.set('isClock', !isClock);
     this.set('isCalender', isClock);
     this.set('openOnce', 0);

     this.changeDialogHeight();
   },

   /**
    * closes all dialogs
    *
    * @event togglePicker
    */
   close: function()
   {
     this.set('backupTimestamp', this.get('timestamp'));
     this.removeContainer();

     this.set('isClock', false);
     this.set('isCalender', false);
     this.set('openOnce', 0);
   },

   /**
    * closes all dialogs and resets the timestamp
    *
    * @event togglePicker
    */
   cancel: function()
   {
     this.set('timestamp', this.get('backupTimestamp'));
     this.removeContainer();

     this.set('isClock', false);
     this.set('isCalender', false);
     this.set('openOnce', 0);
   }
  }
});
