/**
 * @module Components
 *
 */
import Ember from 'ember';
import layout from '../templates/components/paper-datetime-picker';
import moment from 'moment';
import Time from 'busy-utils/time';
import Assert from 'busy-utils/assert';

/**
 * `Component/paper-datetime-picker`
 *
 * @class PaperDatetimePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  /**
   * @private
   * @property classNames
   * @type String
   * @default paper-datetime-picker
   */
  classNames: ['paper-datetime-picker'],
  layout: layout,

  /**
   * timestamp that is passed in when using paper-datetime-picker
   *
   * @private
   * @property timestamp
   * @type Number
   */
  timestamp: null,

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
   * can be passed in so a date before the minDate cannot be selected
   *
   * @private
   * @property minDate
   * @type Number
   * @optional
   */
  minDate: null,

  /**
   * can be passed in to give the input an initial class
   *
   * @private
   * @property class
   * @type String
   * @optional
   */
  class: null,

  /**
   * can be passed in as true or false, true sets timepicker to handle unix timestamp * 1000, false sets it to handle unix timestamp
   *
   * @private
   * @property isMilliseconds
   * @type boolean
   * @optional
   */
  isMilliseconds: false,

  /**
   * Merdian (AM/PM) that is shown in the input bar
   *
   * @private
   * @property timestampMeridian
   * @type String
   */
  timestampMeridian: null,

  /**
   * minutes that are shown in the input bar
   *
   * @private
   * @property timestampMinutes
   * @type String
   */
  timestampMinutes: null,

  /**
   * hours that are shown in the input bar
   *
   * @private
   * @property timestampHours
   * @type String
   */
  timestampHours: null,

  /**
   * days that are shown in the input bar
   *
   * @private
   * @property timestampDays
   * @type String
   */
  timestampDays: null,

  /**
   * months that are shown in the input bar
   *
   * @private
   * @property timestampMonths
   * @type String
   */
  timestampMonths: null,

  /**
   * years that are shown in the input bar
   *
   * @private
   * @property timestampYears
   * @type String
   */
  timestampYears: null,

  /**
   * bool for if the dialog is being shown or not
   *
   * @private
   * @property showDialogTop
   * @type bool
   */
  showDialogTop: false,

  /**
   * bool for if the dialog is being shown or not
   *
   * @private
   * @property showDialogBottom
   * @type bool
   */
  showDialogBottom: false,

  /**
   * string of the new active element on the picker
   *
   * @private
   * @property activeSection
   * @type string
   */
  activeSection: null,

  /**
   * value changes if the active section is changed to a different value or the SAME value
   *
   * @private
   * @property updateActive
   * @type Boolean
   */
  updateActive: true,

  /**
   * value shared with combined picker to destroy both dialogs when closed
   *
   * @private
   * @property destroyElements
   * @type Boolean
   */
  destroyElements: false,

  /**
   * value thats used to only allow one action to be sent each keyup/heydown for calender
   *
   * @private
   * @property keyHasGoneUp
   * @type Boolean
   */
  keyHasGoneUp: true,

  /**
   * checks if timestamp is valid calls updateInputValues
   *
   * @private
   * @method init
   * @constructor
   */
  init: function()
  {
    this._super();

    if (!Ember.isNone(this.get('minDate'))) {
      if (!moment(this.get('minDate')).isValid() || !moment.isMoment(moment(this.get('minDate'))) || typeof this.get('minDate') !== 'number') {
        Assert.throw("mindate must be a valid unix timestamp");
      }
    }

    if (!Ember.isNone(this.get('maxDate'))) {
      if (!moment(this.get('maxDate')).isValid() || !moment.isMoment(moment(this.get('maxDate'))) || typeof this.get('maxDate') !== 'number') {
        Assert.throw("maxDate must be a valid unix timestamp");
      }
    }

    let time = moment(this.get('timestamp'));
    if (!Ember.isNone(this.get('timestamp'))) {
      if (moment.isMoment(time) && time.isValid()) {
        this.updateInputValues();
      } else {
        Assert.throw("timestamp must be a valid unix timestamp");
      }
    } else {
      Assert.throw("timestamp must be a valid unix timestamp");
    }

    if (typeof this.get('isMilliseconds') !== 'boolean') {
      Assert.throw("isMilliseconds must be a boolean'");
    }
  },

  /**
   * observes the timestamp and updates the input values accordingly
   *
   * @private
   * @method updateInputValues
   */
  updateInputValues: Ember.observer('timestamp', function() {
    let time;
    if (this.get('isMilliseconds')) {
      time = moment(this.get('timestamp'));
    } else {
      time = Time.date(this.get('timestamp'));
    }

    this.set('timestampMeridian', time.format('A'));
    this.set('timestampMinutes', time.format('mm'));
    this.set('timestampHours', time.format('hh'));
    this.set('timestampDays', time.format('DD'));
    this.set('timestampMonths', time.format('MM'));
    this.set('timestampYears', time.format('YYYY'));
  }),

  /**
   * observes the destroyElements value shared with combined picker and destroys both dialogs if set to true
   *
   * @private
   * @method updateInputValues
   */
  destroyOnChange: Ember.observer('destroyElements', function() {
    if (this.get('destroyElements')) {
      this.set('showDialogTop', false);
      this.set('showDialogBottom', false);
    }
  }),

  /**
   * receives a moment object and sets it to timestamp
   *
   * @private
   * @method setTimestamp
   * @param moment {object} moment object
   */
  setTimestamp: function(moment) {
    if (this.get('isMilliseconds')) {
      let reverse = Time.timestamp(moment);
      this.set('timestamp', reverse);
    } else {
      let reverse = moment.unix();
      this.set('timestamp', reverse);
    }
  },

  /**
   * only allows up and down arrows and tabs to be affected
   *
   * @private
   * @method onlyAllowArrows
   * @param {event} key press event
   */
  onlyAllowArrows: function(event) {
    var key = event.keyCode || event.which;

    if (key === 13) {
      this.set('showDialogTop', false);
      this.set('showDialogBottom', false);
    }

    if (key === 37 || key === 38 || key === 39 || key === 40 || key === 9) {
      return true;
    } else {
      event.returnValue = false;
      if(event.preventDefault) {
        event.preventDefault();
      }
    }
  },

  /**
   * removes display none from the dialog containers
   *
   * @private
   * @method addContainer
   */
  addContainer: function() {
    Ember.$('.bottom-dialog-container').removeClass('removeDisplay');
    Ember.$('.top-dialog-container').removeClass('removeDisplay');
  },

  /**
   * returns the correct moment objects, depending on if the timestamps are milliseconds or not
   *
   * @private
   * @method getCorrectMomentObjects
   * @return object
   */
  getCorrectMomentObjects: function() {
    let time, minDate, maxDate;
    if (this.get('isMilliseconds')) {
      time = moment(this.get('timestamp'));
      minDate = moment(this.get('minDate'));
      maxDate = moment(this.get('maxDate'));
    } else {
      time = Time.date(this.get('timestamp'));
      minDate = Time.date(this.get('minDate'));
      maxDate = Time.date(this.get('maxDate'));
    }

    return {time, minDate, maxDate};
  },

  actions: {

    /**
     * figures out if the dialog should go above or below the input and changes updateActive so combined-picker can make the correct changes
     *
     * @param active {string} string of which input field was selected
     * @event focusInput
     */
    focusInput: function(active)
    {
      let activeState = this.get('updateActive');
      let scrollTop = Ember.$(window).scrollTop();
      let elementOffsetTop = Ember.$('.paper-datetime-picker').offset().top;
      let distanceTop = (elementOffsetTop - scrollTop);
      let distanceBottom = Ember.$(document).height() - Ember.$('.paper-datetime-picker').offset().top - Ember.$('.paper-datetime-picker').height();

      if (distanceTop > distanceBottom) {
        this.set('showDialogBottom', false);
        this.set('showDialogTop', true);
        this.set('updateActive', !activeState);
      } else {
        this.set('showDialogTop', false);
        this.set('showDialogBottom', true);
        this.set('updateActive',  !activeState);
      }

      this.set('destroyElements', false);
      this.set('activeSection', active);
      this.addContainer();
    },

    /**
     * handles up and down arrows pressed while in the minutes input fields
     *
     * @event keyUpDownHours
     */
    keyUpDownMinutes: function()
    {
      let timestamps = this.getCorrectMomentObjects();
      let object = null;
      let code = event.keyCode || event.which;

      this.onlyAllowArrows(event);

      if (code === 38 || code === 39) {
        if (timestamps.time.minutes() + 1 >= 60) {
          object = timestamps.time.subtract(59, 'minutes');

          if (!object.isBefore(timestamps.minDate)) {
            this.setTimestamp(object);
          }
        } else {
          object = timestamps.time.add(1, 'minutes');

          if (!object.isAfter(timestamps.maxDate)) {
            this.setTimestamp(object);
          }
        }
      }

      if (code === 37 || code === 40) {
        if (timestamps.time.minutes() - 1 < 0) {
          object = timestamps.time.add(59, 'minutes');

          if (!object.isAfter(timestamps.maxDate)) {
            this.setTimestamp(object);
          }
        } else {
          object = timestamps.time.subtract(1, 'minutes');

          if (!object.isBefore(timestamps.minDate)) {
              this.setTimestamp(object);
          }
        }
      }
    },

    /**
     * handles up and down arrows pressed while in the hours input fields
     *
     * @event keyUpDownHours
     */
    keyUpDownHours: function()
    {
      let timestamps = this.getCorrectMomentObjects();
      let object = null;
      let code = event.keyCode || event.which;

      this.onlyAllowArrows(event);

      if (code === 38 || code === 39) {
        if (((timestamps.time.hour() + 1) % 12) >= 12) {
          object = timestamps.time.subtract(11, 'hours');

          if (!object.isBefore(timestamps.minDate)) {
            this.setTimestamp(object);
          }
        } else {
          object = timestamps.time.add(1, 'hours');

          if (!object.isAfter(timestamps.maxDate)) {
            this.setTimestamp(object);
          }
        }
      }

      if (code ===37 || code === 40) {
        if (timestamps.time.hour() - 1 < 0) {
          object = timestamps.time.add(11, 'hours');

          if (!object.isAfter(timestamps.maxDate)) {
            this.setTimestamp(object);
          }
        } else {
          object = timestamps.time.subtract(1, 'hours');

          if (!object.isBefore(timestamps.minDate)) {
            this.setTimestamp(object);
          }
        }
      }
    },

    /**
     * handles up and down arrows pressed while in the days, months, or years input fields
     *
     * @param {string} 'days', 'years,', or 'months'
     * @event keyUpDownHandler
     */
    keyUpDownHandler: function(period)
    {
      let timestamps = this.getCorrectMomentObjects();
      let object = null;
      let code = event.keyCode || event.which;

      this.onlyAllowArrows(event);

      if (this.get('keyHasGoneUp') === true) {

        if (code === 38 || code === 39) {
          object = timestamps.time.add(1, period);

          if (!object.isAfter(timestamps.maxDate)) {
            this.setTimestamp(object);
          }
        }

        if (code === 37 || code === 40) {
          object = timestamps.time.subtract(1, period);

          if (!object.isBefore(timestamps.minDate)) {
            this.setTimestamp(object);
          }
        }

        this.set('keyHasGoneUp', false);
      }
    },

    /**
     * allows keyup/keydown handlers to work for calender inputs
     *
     * @event resetKeyUp
     */
    resetKeyUp: function()
    {
      this.set('keyHasGoneUp', true);
    },

    /**
     * handles up and down arrows pressed while in the meridian input fields
     *
     * @event meridianKeyHandler
     */
    meridianKeyHandler: function()
    {
      let timestamps = this.getCorrectMomentObjects();
      let object = null;
      let code = event.keyCode || event.which;

      this.onlyAllowArrows(event);

      if (code ===37 || code === 38 || code === 39 || code === 40) {
        if (timestamps.time.format('A') === 'AM') {
          object = timestamps.time.add(12, 'hours');

          if (!object.isAfter(timestamps.maxDate)) {
            this.setTimestamp(object);
          }
        } else {
          object = timestamps.time.subtract(12, 'hours');

          if (!object.isBefore(timestamps.minDate)) {
            this.setTimestamp(object);
          }
        }
      }
    }

  }
});
