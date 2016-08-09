//
//
//TODO: Comment this and clean it up. Then I will give you more comments on this one.
//
//


import Ember from 'ember';
import layout from '../templates/components/paper-datetime-picker';
import moment from 'moment';

export default Ember.Component.extend({

    classNames: ['paper-datetime-picker'],
    layout: layout,

    timestamp: null,

    maxDate: null,
    minDate: null,

    timestampMeridian: null,
    timestampMinutes: null,
    timestampHours: null,
    timestampDays: null,
    timestampMonths: null,
    timestampYears: null,

    showInTimeClock: true,

    init: function()
    {
        this._super();

        if (Ember.isNone(this.get('timestamp')))
        {
            let now = moment();
            let back = now.unix() * 1000;
            this.set('timestamp', back);
        }
    },

    setupInitialValues: Ember.on('init', Ember.observer('timestamp', function() {
        let time = moment(this.get('timestamp'));
        let meridianFormat = time.format('A');
        let minutesFormat = time.format('mm');
        let hoursFormat = time.format('hh');
        let daysFormat = time.format('DD');
        let monthsFormat = time.format('MM');
        let yearsFormat = time.format('YYYY');

        this.set('timestampMeridian', meridianFormat);
        this.set('timestampMinutes', minutesFormat);
        this.set('timestampHours', hoursFormat);
        this.set('timestampDays', daysFormat);
        this.set('timestampMonths', monthsFormat);
        this.set('timestampYears', yearsFormat);
    })),

    updateInputValues: Ember.observer('timestamp', function() {
        let time = moment(this.get('timestamp'));
        let meridianFormat = time.format('A');
        let minutesFormat = time.format('mm');
        let hoursFormat = time.format('hh');
        let daysFormat = time.format('DD');
        let monthsFormat = time.format('MM');
        let yearsFormat = time.format('YYYY');

        this.set('timestampMeridian', meridianFormat);
        this.set('timestampMinutes', minutesFormat);
        this.set('timestampHours', hoursFormat);
        this.set('timestampDays', daysFormat);
        this.set('timestampMonths', monthsFormat);
        this.set('timestampYears', yearsFormat);
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
                if (time.hour() + 1 >= 12)
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
