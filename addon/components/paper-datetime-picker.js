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

  showDialog: true,

  init: function()
  {
    this._super();

    if (Ember.isNone(this.get('timestamp')))
    {
      let now = moment();
      let back = now.unix() * 1000;
      this.set('timestamp', back);
      this.set('minDate', moment().subtract('hours', '2').subtract('minutes', '22').unix() * 1000);
      this.set('maxDate', moment().add('hours', '2').add('minutes', '22').unix() * 1000);
    }
    this.updateInputValues();
  },

    updateInputValues: Ember.observer('timestamp', function() {
      const time = moment(this.get('timestamp'));

      this.set('timestampMeridian', time.format('A'));
      this.set('timestampMinutes', time.format('mm'));
      this.set('timestampHours', time.format('hh'));
      this.set('timestampDays', time.format('DD'));
      this.set('timestampMonths', time.format('MM'));
      this.set('timestampYears', time.format('YYYY'));
    }),

    setTimestamp: function(moment)
    {
        let reverse = moment.unix() * 1000;
        this.set('timestamp', reverse);
    },

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

        focusInput: function(action)
        {
            console.log(action);
        },

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

        clockInMeridianKeyDown: function()
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
