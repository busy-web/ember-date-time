import Ember from 'ember';
import layout from '../templates/components/paper-new-time-entry';
import moment from 'moment';

export default Ember.Component.extend({

    classNames: ['paper-new-time-entry'],
    layout: layout,

    inTimestamp: null,
    outTimestamp: null,

    clockInMeridian: null,
    clockInMinutes: null,
    clockInHours: null,
    clockInDays: null,
    clockInMonths: null,
    clockInYears: null,

    clockOutMeridian: null,
    clockOutMinutes: null,
    clockOutHours: null,
    clockOutDays: null,
    clockOutMonths: null,
    clockOutYears: null,

    init: function()
    {
        this._super();

        var start = moment();
        var end = moment();

        var startOf = start.startOf('day');
        var endOf = end.startOf('day');

        var startTime = startOf.add(9, 'hours');
        var endTime = endOf.add(17, 'hours');

        this.set('inTimestamp', (startTime.unix() * 1000));
        this.set('outTimestamp', (endTime.unix() * 1000));
    },

    initClockInMeridian: Ember.on('init', Ember.observer('inTimestamp', function() {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('A');

        this.set('clockInMeridian', newFormat);
    })),

    observesClockInMeridian: Ember.observer('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('A');

        this.set('clockInMeridian', newFormat);
    }),

    initClockInMinutes: Ember.on('init', Ember.observer('inTimestamp', function() {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('mm');

        this.set('clockInMinutes', newFormat);
    })),

    observesClockInMinutes: Ember.observer('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('mm');

        this.set('clockInMinutes', newFormat);
    }),

    initClockInHours: Ember.on('init', Ember.observer('inTimestamp', function() {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('hh');

        this.set('clockInHours', newFormat);
    })),

    observesClockInHours: Ember.observer('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('hh');

        this.set('clockInHours', newFormat);
    }),

    initClockInDays: Ember.on('init', Ember.observer('inTimestamp', function() {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('DD');

        this.set('clockInDays', newFormat);
     })),

    observesClockInDays: Ember.observer('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('DD');

        this.set('clockInDays', newFormat);
    }),

    initClockInMonths: Ember.on('init', Ember.observer('inTimestamp', function() {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('MM');

        this.set('clockInMonths', newFormat);
    })),

    observesClockInMonths: Ember.observer('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('MM');

        this.set('clockInMonths', newFormat);
    }),

    initClockInYears: Ember.on('init', Ember.observer('inTimestamp', function() {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('YYYY');

        this.set('clockInYears', newFormat);
    })),

    observesClockInYears: Ember.observer('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('YYYY');

        this.set('clockInYears', newFormat);
    }),

    initClockOutMeridian: Ember.on('init', Ember.observer('outTimestamp', function() {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('A');

        this.set('clockOutMeridian', newFormat);
    })),

    observesClockOutMeridian: Ember.observer('outTimestamp', function()
    {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('A');

        this.set('clockOutMeridian', newFormat);
    }),

    initClockOutMinutes: Ember.on('init', Ember.observer('outTimestamp', function() {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('mm');

        this.set('clockOutMinutes', newFormat);
    })),

    observesClockOutMinutes: Ember.observer('outTimestamp', function()
    {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('mm');

        this.set('clockOutMinutes', newFormat);
    }),

    initClockOutHours: Ember.on('init', Ember.observer('outTimestamp', function() {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('hh');

        this.set('clockOutHours', newFormat);
    })),

    observesClockOutHours: Ember.observer('outTimestamp', function()
    {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('hh');

        this.set('clockOutHours', newFormat);
    }),

    initClockOutDays: Ember.on('init', Ember.observer('outTimestamp', function() {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('DD');

        this.set('clockOutDays', newFormat);
     })),

    observesClockOutDays: Ember.observer('outTimestamp', function()
    {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('DD');

        this.set('clockOutDays', newFormat);
    }),

    initClockOutMonths: Ember.on('init', Ember.observer('outTimestamp', function() {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('MM');

        this.set('clockOutMonths', newFormat);
    })),

    observesClockOutMonths: Ember.observer('outTimestamp', function()
    {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('MM');

        this.set('clockOutMonths', newFormat);
    }),

    initClockOutYears: Ember.on('init', Ember.observer('outTimestamp', function() {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('YYYY');

        this.set('clockOutYears', newFormat);
    })),

    observesClockOutYears: Ember.observer('outTimestamp', function()
    {
        var time = this.get('outTimestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('YYYY');

        this.set('clockOutYears', newFormat);
    }),

    actions: {

        focusOutClockInMonth: function()
        {
            var month = (parseInt(this.get('clockInMonths')) - 1);
            var clockInTimestamp = this.get('inTimestamp');
            var momentObj = moment(clockInTimestamp);

            if (!this.get('clockInMonths'))
            {
                var currentMonth = momentObj.month();
                console.log(currentMonth);
                console.log('here');
                var reset = momentObj.month(1);
                console.log(reset);
                // this.set('inTimestamp', reset);
            }
            else
            {
                var newTime = momentObj.month(month);
                this.set('inTimestamp', newTime);
            }
        },

        keyUpDownClockInMonth: function(type, value)
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObjAdd = moment(time);
                var setTimeAdd = momentObjAdd.month();
                if (this.get(value) !== setTimeAdd)
                {
                    var newStrAdd = (parseInt(this.get(value)));
                    var newTimeAdd = momentObjAdd.month(newStrAdd);
                    this.set('inTimestamp', newTimeAdd);
                }
                else
                {
                    var momentObjAddElse = moment(time);
                    momentObjAddElse.add(1, type);
                    var reverseConversionAddElse = momentObjAddElse.unix() * 1000;
                    this.set('inTimestamp', reverseConversionAddElse);
                }
            }

            if (code === 40)
            {
                var momentObjMinus = moment(time);
                var setTimeMinus = momentObjMinus.month();
                if (this.get(value) !== setTimeMinus)
                {
                    var newStrMinus = (parseInt(this.get(value)) - 2);
                    var newTimeMinus = momentObjMinus.month(newStrMinus);
                    this.set('inTimestamp', newTimeMinus);
                }
                else
                {
                    var momentObjMinusElse = moment(time);
                    momentObjMinusElse.subtract(1, type);
                    var reverseConversionMinus = momentObjMinusElse.unix() * 1000;
                    this.set('inTimestamp', reverseConversionMinus);
                }
            }

            var key = event.keyCode || event.which;
            key = String.fromCharCode(key);
            var regex = /[0-9]|\./;
            if( !regex.test(key) )
            {
                console.log(code);
                if (code === 46 || code === 8 || code === 9)
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
            }

        },

        keyUpDownIn: function()
        {

        },

        keyUpDownOut: function(type)
        {
            var time = this.get('outTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObj = moment(time);
                momentObj.add(1, type);
                var reverseConversion = momentObj.unix() * 1000;
                this.set('outTimestamp', reverseConversion);
            }
            if (code === 40)
            {
                var momentObj2 = moment(time);
                momentObj2.subtract(1, type);
                var reverseConversion2 = momentObj2.unix() * 1000;
                this.set('outTimestamp', reverseConversion2);
            }
        },

        clockInMeridianKeyDown: function()
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38 || code === 40)
            {
                var current = this.get('clockInMeridian');
                var momentObj = moment(time);
                if (current === 'AM')
                {
                    momentObj.add(12, 'hours');
                    var reverseConversion = momentObj.unix() * 1000;
                    this.set('inTimestamp', reverseConversion);
                }
                else
                {
                    momentObj.subtract(12, 'hours');
                    var reverseConversionBack = momentObj.unix() * 1000;
                    this.set('inTimestamp', reverseConversionBack);
                }
            }
        },

        clockOutMeridianKeyDown: function()
        {
            var time = this.get('outTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38 || code === 40)
            {
                var current = this.get('clockOutMeridian');
                var momentObj = moment(time);
                if (current === 'AM')
                {
                    momentObj.add(12, 'hours');
                    var reverseConversion = momentObj.unix() * 1000;
                    this.set('outTimestamp', reverseConversion);
                }
                else
                {
                    momentObj.subtract(12, 'hours');
                    var reverseConversionBack = momentObj.unix() * 1000;
                    this.set('outTimestamp', reverseConversionBack);
                }
            }
        }
    }
});
