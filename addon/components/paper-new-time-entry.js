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

    clockInMinutesTyped: Ember.observer('clockInMinutes', function()
    {
        var minutes = this.get('clockInMinutes');
        var clockInTimestamp = this.get('inTimestamp');
        var momentObj = moment(clockInTimestamp);
        var newTime = momentObj.minutes(minutes);

        console.log(minutes);
        this.set('inTimestamp', newTime);
    }),

    actions: {

        addMeridian: function()
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObj = moment(time);
                momentObj.add(1, 'minutes');
                var reverseConversion = momentObj.unix() * 1000;
                this.set('inTimestamp', reverseConversion);
            }
            if (code === 40)
            {
                var momentObj2 = moment(time);
                momentObj2.subtract(1, 'minutes');
                var reverseConversion2 = momentObj2.unix() * 1000;
                this.set('inTimestamp', reverseConversion2);
            }
        },

        addMinutes: function()
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObj = moment(time);
                momentObj.add(1, 'minutes');
                var reverseConversion = momentObj.unix() * 1000;
                this.set('inTimestamp', reverseConversion);
            }
            if (code === 40)
            {
                var momentObj2 = moment(time);
                momentObj2.subtract(1, 'minutes');
                var reverseConversion2 = momentObj2.unix() * 1000;
                this.set('inTimestamp', reverseConversion2);
            }
        },

        addHours: function()
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObj = moment(time);
                momentObj.add(1, 'hours');
                var reverseConversion = momentObj.unix() * 1000;
                this.set('inTimestamp', reverseConversion);
            }
            if (code === 40)
            {
                var momentObj2 = moment(time);
                momentObj2.subtract(1, 'hours');
                var reverseConversion2 = momentObj2.unix() * 1000;
                this.set('inTimestamp', reverseConversion2);
            }
        },

        addDays: function(value, event)
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObj = moment(time);
                momentObj.add(1, 'days');
                var reverseConversion = momentObj.unix() * 1000;
                this.set('inTimestamp', reverseConversion);
            }
            if (code === 40)
            {
                var momentObj2 = moment(time);
                momentObj2.subtract(1, 'days');
                var reverseConversion2 = momentObj2.unix() * 1000;
                this.set('inTimestamp', reverseConversion2);
            }
        },

        addMonths: function()
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObj = moment(time);
                momentObj.add(1, 'months');
                var reverseConversion = momentObj.unix() * 1000;
                this.set('inTimestamp', reverseConversion);
            }
            if (code === 40)
            {
                var momentObj2 = moment(time);
                momentObj2.subtract(1, 'months');
                var reverseConversion2 = momentObj2.unix() * 1000;
                this.set('inTimestamp', reverseConversion2);
            }
        },

        addYears: function()
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObj = moment(time);
                momentObj.add(1, 'years');
                var reverseConversion = momentObj.unix() * 1000;
                this.set('inTimestamp', reverseConversion);
            }
            if (code === 40)
            {
                var momentObj2 = moment(time);
                momentObj2.subtract(1, 'years');
                var reverseConversion2 = momentObj2.unix() * 1000;
                this.set('inTimestamp', reverseConversion2);
            }
        }
    }
});
