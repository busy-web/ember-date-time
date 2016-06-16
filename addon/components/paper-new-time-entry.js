import Ember from 'ember';
import layout from '../templates/components/paper-new-time-entry';
import moment from 'moment';

export default Ember.Component.extend({

    classNames: ['paper-new-time-entry'],
    layout: layout,

    inTimestamp: null,
    outTimestamp: null,

    showInTimeClock: null,
    showOutTimeClock: null,

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

    // auto-tabbing junk
    currentInput: null,
    currentInputMaxlength: null,
    acceptedCharacter: null,

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

    observesCurrentInput: Ember.observer('currentInput', function()
    {
        var input = Ember.$(this.get('currentInput'));
        this.set('currentInputMaxlength', input[0].maxLength);
    }),

    checkRestrictedCharacter: function(event)
    {
        var key = event.keyCode || event.which;
        var newkey = String.fromCharCode(key);
        var regex = /[0-9]|\./;

        if( !regex.test(newkey) )
        {
            if (key === 46 || key === 8 || key === 9)
            {
                this.set('acceptedCharacter', false);
                return true;
            }
            else
            {
                event.returnValue = false;
                if(event.preventDefault)
                {
                    event.preventDefault();
                }
                this.set('acceptedCharacter', false);
            }
        }
        else
        {
            this.set('acceptedCharacter', true);
        }
    },

    closeOtherDialogs: function(openDialog)
    {
        if (openDialog === "showInTimeClock")
        {
            this.set('showInTimeClock', true);
            this.set('showOutTimeClock', false);
        }
        if (openDialog === 'showOutTimeClock')
        {
            this.set('showOutTimeClock', true);
            this.set('showInTimeClock', false);
        }
    },

    actions: {

        focusInput: function(id, openDialog)
        {
            Ember.$(id).select();

            this.set('currentInput', id);

            this.closeOtherDialogs(openDialog);
        },

        checkAutoTab: function(nextInput)
        {
            var code = event.keyCode || event.which;

            var name = this.get('currentInput').slice(1);
            var value = this.get(name);
            if (this.get('currentInputMaxlength') === value.length)
            {
                if (code !== 38 && code !== 40 && this.get('acceptedCharacter'))
                {
                    this.set('acceptedCharacter', false);
                    var next = Ember.$(nextInput);
                    next.focus();
                }
            }
        },

        focusOutClockMonth: function(timestamp, value)
        {
            var month = (parseInt(this.get(value)) - 1);
            var clockInTimestamp = this.get(timestamp);
            var momentObj = moment(clockInTimestamp);

            if (Ember.isEmpty(month) || Ember.isNone(month) || isNaN(month))
            {
                var currentMonth = momentObj.month();
                var reset = momentObj.month(currentMonth);
                this.set(timestamp, reset);
            }
            else
            {
                var newTime = momentObj.month(month);
                this.set(timestamp, newTime);
            }
        },

        focusOutClockDay: function(timestamp, value)
        {
            var day = (parseInt(this.get(value)));
            var clockInTimestamp = this.get(timestamp);
            var momentObj = moment(clockInTimestamp);

            if (Ember.isEmpty(day) || Ember.isNone(day) || isNaN(day))
            {
                var currentDay = momentObj.date();
                var reset = momentObj.date(currentDay);
                this.set(timestamp, reset);
            }
            else
            {
                var newTime = momentObj.date(day);
                this.set(timestamp, newTime);
            }
        },

        focusOutClockYear: function(timestamp, value)
        {
            var year = (parseInt(this.get(value)));
            var clockInTimestamp = this.get(timestamp);
            var momentObj = moment(clockInTimestamp);

            if (Ember.isEmpty(year) || Ember.isNone(year) || isNaN(year))
            {
                var currentYear = momentObj.year();
                var reset = momentObj.year(currentYear);
                this.set(timestamp, reset);
            }
            else
            {
                var newTime = momentObj.year(year);
                this.set(timestamp, newTime);
            }
        },

        focusOutClockHour: function(timestamp, value)
        {
            var hour = (parseInt(this.get(value)));
            var newTimestamp = this.get(timestamp);
            var momentObj = moment(newTimestamp);

            if (Ember.isEmpty(hour) || Ember.isNone(hour) || isNaN(hour))
            {
                var currentHour = momentObj.hour();
                var reset = momentObj.hour(currentHour);
                this.set(timestamp, reset);
            }
            else
            {
                var currentMeridian = momentObj.format('A');
                if (currentMeridian === 'AM')
                {
                    if (hour === 12)
                    {
                        var newTime = momentObj.hour('0');
                        this.set(timestamp, newTime);
                    }
                    else
                    {
                        var newTime2 = momentObj.hour(hour);
                        this.set(timestamp, newTime2);
                    }
                }
                else
                {
                    if (hour === 12)
                    {
                        var newTime3 = momentObj.hour('12');
                        this.set(timestamp, newTime3);
                    }
                    else
                    {
                        var newTime4 = momentObj.hour(hour + 12);
                        this.set(timestamp, newTime4);
                    }
                }
            }
        },

        focusOutClockMinute: function(timestamp, value)
        {
            var minute = (parseInt(this.get(value)));
            var clockInTimestamp = this.get(timestamp);
            var momentObj = moment(clockInTimestamp);

            if (Ember.isEmpty(minute) || Ember.isNone(minute) || isNaN(minute))
            {
                var currentMinute = momentObj.minute();
                var reset = momentObj.minute(currentMinute);
                this.set(timestamp, reset);
            }
            else
            {
                if (minute >= 60)
                {
                    minute = minute % 60;
                    var newTime = momentObj.minute(minute);
                    this.set(timestamp, newTime);
                }
                else
                {
                    var newTime2 = momentObj.minute(minute);
                    this.set(timestamp, newTime2);
                }
            }
        },

        focusOutClockMeridian: function(timestamp, value)
        {
            console.log('here');

            var current = this.get(value);
            var time = this.get(timestamp);
            var momentObj = moment(time);
            var reset = momentObj.format('A');
            if (Ember.isEmpty(current) || Ember.isNone(current))
            {
                this.set(value, reset);
            }

            var allowed = ['a', 'A', 'p', 'P', 'am', 'AM', 'pm', 'PM'];

            if (allowed.indexOf(current) >= 0)
            {
                if (current === 'a' || current === 'A' || current === 'am' || current === 'AM')
                {
                    if (reset === 'AM')
                    {
                        this.set(value, reset);
                    }
                    if (reset === 'PM')
                    {
                        momentObj.subtract(12, 'hours');
                        var reverseConversionBack = momentObj.unix() * 1000;
                        this.set(timestamp, reverseConversionBack);
                    }
                }
                else
                {
                    if (reset === 'PM')
                    {
                        this.set(value, reset);
                    }
                    if (reset === 'AM')
                    {
                        momentObj.add(12, 'hours');
                        var reverseConversionBack2 = momentObj.unix() * 1000;
                        this.set(timestamp, reverseConversionBack2);
                    }
                }
            }
            else
            {
                this.set(value, reset);
            }
        },

        keyUpDownMinutes: function(timestamp, value)
        {
            var time = this.get(timestamp);
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObjUp = moment(time);

                if (momentObjUp.minutes() + 1 >= 60)
                {
                    momentObjUp.subtract(59, 'minutes');
                }
                else
                {
                    momentObjUp.add(1, 'minutes');
                }
                var reverseConversionUp = momentObjUp.unix() * 1000;
                this.set(timestamp, reverseConversionUp);
            }
            if (code === 40)
            {
                var momentObjDown = moment(time);

                if (momentObjDown.minutes() - 1 < 0)
                {
                    momentObjDown.add(59, 'minutes');
                }
                else
                {
                    momentObjDown.subtract(1, 'minutes');
                }
                var reverseConversionDown = momentObjDown.unix() * 1000;
                this.set(timestamp, reverseConversionDown);
            }

            var current = this.get(value);

            if (current.length < 2)
            {
                if (parseInt(current + event.key) > 59)
                {
                    console.log('Minutes must be in between 0 - 60');
                    event.returnValue = false;
                    if(event.preventDefault)
                    {
                        event.preventDefault();
                    }
                    this.set('acceptedCharacter', false);
                }
            }

            this.checkRestrictedCharacter(event);
        },

        keyUpDownHours: function(timestamp, value)
        {
            var time = this.get(timestamp);
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var momentObjUp = moment(time);

                if (momentObjUp.hour() + 1 >= 12)
                {
                    momentObjUp.subtract(11, 'hours');
                }
                else
                {
                    momentObjUp.add(1, 'hours');
                }
                var reverseConversionUp = momentObjUp.unix() * 1000;
                this.set(timestamp, reverseConversionUp);
            }
            if (code === 40)
            {
                var momentObjDown = moment(time);

                if (momentObjDown.hour() - 1 < 0)
                {
                    momentObjDown.add(11, 'hours');
                }
                else
                {
                    momentObjDown.subtract(1, 'hours');
                }
                var reverseConversionDown = momentObjDown.unix() * 1000;
                this.set(timestamp, reverseConversionDown);
            }

            var current = this.get(value);

            if (current.length < 2)
            {
                if (parseInt(current + event.key) > 12)
                {
                    console.log('hours must be in between 0 - 12');
                    event.returnValue = false;
                    if(event.preventDefault)
                    {
                        event.preventDefault();
                    }
                    this.set('acceptedCharacter', false);
                }
            }

            this.checkRestrictedCharacter(event);
        },

        keyUpDownHandler: function(timestamp, amount)
        {
            var time = this.get(timestamp);
            var code = event.keyCode || event.which;

            if (code === 38)
            {
                var momentObjUp = moment(time);
                momentObjUp.add(1, amount);
                var reverseConversionUp = momentObjUp.unix() * 1000;
                this.set(timestamp, reverseConversionUp);
            }
            if (code === 40)
            {
                var momentObjDown = moment(time);
                momentObjDown.subtract(1, amount);
                var reverseConversionDown = momentObjDown.unix() * 1000;
                this.set(timestamp, reverseConversionDown);
            }

            this.checkRestrictedCharacter(event);
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
            if (code !== 46 && code !== 8 && code !== 9)
            {
                this.set('acceptedCharacter', true);
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
