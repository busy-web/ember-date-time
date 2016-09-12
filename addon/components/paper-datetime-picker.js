/**
 * @module Components
 *
 */
import Ember from 'ember';
import layout from '../templates/components/paper-datetime-picker';
import moment from 'moment';

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
   * checks if timestamp is valid calls updateInputValues
   *
   * @private
   * @method init
   * @constructor
   */
  init: function()
  {
    this._super();

    if (!Ember.isNone(this.get('minDate')))
    {
      if (!moment(this.get('minDate')).isValid() || !moment.isMoment(moment(this.get('minDate'))) || typeof this.get('minDate') !== 'number')
      {
          Ember.assert("mindate must be a valid unix timestamp");
      }
    }

    if (!Ember.isNone(this.get('maxDate')))
    {
      if (!moment(this.get('maxDate')).isValid() || !moment.isMoment(moment(this.get('maxDate'))) || typeof this.get('maxDate') !== 'number')
      {
          Ember.assert("maxDate must be a valid unix timestamp");
      }
    }

    let time = moment(this.get('timestamp'));
    if (!Ember.isNone(this.get('timestamp')))
    {
      if (moment.isMoment(time) && time.isValid())
      {
        this.updateInputValues();
      }
      else
      {
        Ember.assert("timestamp must be a valid unix timestamp", moment.isMoment(this.get('timestamp')) || typeof this.get('timestamp') === 'number');
      }
    }
    else
    {
      Ember.assert("timestamp must be a valid unix timestamp", moment.isMoment(this.get('timestamp')) || typeof this.get('timestamp') === 'number');
    }
  },

  /**
   * observes the timestamp and updates the input values accordingly
   *
   * @private
   * @method updateInputValues
   */
  updateInputValues: Ember.observer('timestamp', function() {
    const time = moment(this.get('timestamp'));

    this.set('timestampMeridian', time.format('A'));
    this.set('timestampMinutes', time.format('mm'));
    this.set('timestampHours', time.format('hh'));
    this.set('timestampDays', time.format('DD'));
    this.set('timestampMonths', time.format('MM'));
    this.set('timestampYears', time.format('YYYY'));
  }),

  /**
   * receives a moment object and sets it to timestamp
   *
   * @private
   * @method setTimestamp
   * @param moment {object} moment object
   */
  setTimestamp: function(moment)
  {
      let reverse = moment.unix() * 1000;
      this.set('timestamp', reverse);
  },

  /**
   * only allows up and down arrows and tabs to be affected
   *
   * @private
   * @method onlyAllowArrows
   * @param {event} key press event
   */
  onlyAllowArrows: function(event)
  {
      var key = event.keyCode || event.which;

      if (key === 38 || key === 40 || key === 9)
      {
          return true;
      }
      else
      {
          event.returnValue = false;
          if(event.preventDefault)
          {
              event.preventDefault();
          }
      }
  },

  actions: {

      focusInput: function(active)
      {
        let scrollTop = Ember.$(window).scrollTop();
        let elementOffsetTop = Ember.$('.paper-datetime-picker').offset().top;
        let distanceTop = (elementOffsetTop - scrollTop);
        let distanceBottom = Ember.$(document).height() - Ember.$('.paper-datetime-picker').offset().top - Ember.$('.paper-datetime-picker').height();

        this.set('activeSection', active);
        
        if (distanceTop > distanceBottom)
        {
          this.set('showDialogBottom', false);
          this.set('showDialogTop', true);
        }
        else
        {
          this.set('showDialogTop', false);
          this.set('showDialogBottom', true);
        }
      },

      /**
       * handles up and down arrows pressed while in the minutes input fields
       *
       * @event keyUpDownHours
       */
      keyUpDownMinutes: function()
      {
          let time = moment(this.get('timestamp'));
          let object = null;
          let code = event.keyCode || event.which;

          this.onlyAllowArrows(event);

          if (code === 38)
          {
              if (time.minutes() + 1 >= 60)
              {
                  object = time.subtract(59, 'minutes');
                  if (!object.isBefore(moment(this.get('minDate'))))
                  {
                      this.setTimestamp(object);
                  }
              }
              else
              {
                  object = time.add(1, 'minutes');
                  if (!object.isAfter(moment(this.get('maxDate'))))
                  {
                      this.setTimestamp(object);
                  }
              }
          }
          if (code === 40)
          {
              if (time.minutes() - 1 < 0)
              {
                  object = time.add(59, 'minutes');
                  if (!object.isAfter(moment(this.get('maxDate'))))
                  {
                      this.setTimestamp(object);
                  }
              }
              else
              {
                  object = time.subtract(1, 'minutes');
                  if (!object.isBefore(moment(this.get('minDate'))))
                  {
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
          let time = moment(this.get('timestamp'));
          let object = null;
          let code = event.keyCode || event.which;

          this.onlyAllowArrows(event);

          if (code === 38)
          {
              if (((time.hour() + 1) % 12) >= 12)
              {
                  object = time.subtract(11, 'hours');
                  if (!object.isBefore(moment(this.get('minDate'))))
                  {
                      this.setTimestamp(object);
                  }
              }
              else
              {
                  object = time.add(1, 'hours');
                  if (!object.isAfter(moment(this.get('maxDate'))))
                  {
                      this.setTimestamp(object);
                  }
              }
          }
          if (code === 40)
          {
              if (time.hour() - 1 < 0)
              {
                  object = time.add(11, 'hours');
                  if (!object.isAfter(moment(this.get('maxDate'))))
                  {
                      this.setTimestamp(object);
                  }
              }
              else
              {
                  object = time.subtract(1, 'hours');
                  if (!object.isBefore(moment(this.get('minDate'))))
                  {
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
          let time = moment(this.get('timestamp'));
          let object = null;
          let code = event.keyCode || event.which;

          this.onlyAllowArrows(event);

          if (code === 38)
          {
              object = time.add(1, period);
              if (!object.isAfter(moment(this.get('maxDate'))))
              {
                  this.setTimestamp(object);
              }
          }
          if (code === 40)
          {
              object = time.subtract(1, period);
              if (!object.isBefore(moment(this.get('minDate'))))
              {
                  this.setTimestamp(object);
              }
          }
      },

      /**
       * handles up and down arrows pressed while in the meridian input fields
       *
       * @event meridianKeyHandler
       */
      meridianKeyHandler: function()
      {
          let time = moment(this.get('timestamp'));
          let object = null;
          let code = event.keyCode || event.which;

          this.onlyAllowArrows(event);

          if (code === 38 || code === 40)
          {
              if (time.format('A') === 'AM')
              {
                  object = time.add(12, 'hours');
                  if (!object.isAfter(moment(this.get('maxDate'))))
                  {
                      this.setTimestamp(object);
                  }
              }
              else
              {
                  object = time.subtract(12, 'hours');
                  if (!object.isBefore(moment(this.get('minDate'))))
                  {
                      this.setTimestamp(object);
                  }
              }
          }
      },
  }
});
