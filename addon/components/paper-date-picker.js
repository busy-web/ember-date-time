import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/paper-date-picker';

export default Ember.Component.extend({
    classNames: ['paper-date-picker'],
    layout: layout,

    timestamp: null,
    calenderTimestamp: null,

    minDate: null,
    maxDate: null,

    day: null,
    month: null,
    year: null,

    monthYear: null,
    nextMonthYear: null,

    daysArray: null,
    completeArray: null,
    groupedArray: null,

    init: function()
    {
        this._super();
        this.set('calenderTimestamp', this.get('timestamp'));

    },

    resetCalenderTimestamp: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');

        this.set('calenderTimestamp', time);
    }),

    buildDaysArrayForMonth: Ember.on('init', Ember.observer('calenderTimestamp', function() {

        var current = moment(this.get('calenderTimestamp'));

        var daysArray = Ember.A();
        var firstDay = current.clone().startOf('month');
        var lastDay = current.clone().endOf('month');
        var currentDay = firstDay;

        let minDate = moment(this.get('minDate'));
        let maxDate = moment(this.get('maxDate'));

        while (currentDay.isBefore(lastDay)) {
            if (!Ember.isNone(minDate) || !Ember.isNone(maxDate))
            {
                if (!Ember.isNone(minDate))
                {
                    if (!currentDay.isBefore(minDate) && !currentDay.isAfter(maxDate))
                    {
                        currentDay.isDisabled = false;
                        daysArray.pushObject(currentDay);
                        currentDay = currentDay.clone().add('days', 1);
                    }
                    else
                    {
                        currentDay.isDisabled = true;
                        daysArray.pushObject(currentDay);
                        currentDay = currentDay.clone().add('days', 1);
                    }
                }
            }
            else
            {
                currentDay.isDisabled = false;
                daysArray.pushObject(currentDay);
                currentDay = currentDay.clone().add('days', 1);
            }
        }

        this.set('daysArray', daysArray);
    })),

    buildCompleteArray: Ember.observer('daysArray', function()
    {
        var nullHeadLength = 0;
        var monthArrayLength = 42;
        var daysArray = this.get('daysArray');
        var firstDayPosition = daysArray.get('firstObject').day();
        var numberOfDays = daysArray.get('length');

        var completeArray = [];

        for (var i=0; i<firstDayPosition; i++) {
            nullHeadLength++;
            completeArray.push(null);
        }

        daysArray.forEach(function(day)
        {
            completeArray.push(day);
        });

        var nullTailLength = monthArrayLength - nullHeadLength - numberOfDays;

        for (var x=0; x<nullTailLength; x++) {
            nullHeadLength++;
            completeArray.push(null);
        }
        this.set('completeArray', completeArray);
    }),

    groupByWeeks: Ember.observer('completeArray', function()
    {
        var array = this.get('completeArray');
        var grouped = Ember.A([]);

        grouped.pushObject(array.filter(this.inRange(0, 7)));
        grouped.pushObject(array.filter(this.inRange(7, 14)));
        grouped.pushObject(array.filter(this.inRange(14, 21)));
        grouped.pushObject(array.filter(this.inRange(21, 28)));
        grouped.pushObject(array.filter(this.inRange(28, 35)));
        grouped.pushObject(array.filter(this.inRange(35, 42)));

        this.set('groupedArray', grouped);
    }),

    inRange: function(lower, upper)
    {
        return function (each, index) {
            return (index >= lower && index < upper);
        };
    },

    initDayOfWeek: Ember.on('init', Ember.observer('timestamp', function() {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('dddd');

        this.set('dayOfWeek', newFormat);
    })),

    observesDayOfWeek: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('dddd');

        this.set('dayOfWeek', newFormat);
    }),

    initDay: Ember.on('init', Ember.observer('timestamp', function() {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('DD');

        this.set('day', newFormat);
    })),

    observesDay: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('DD');

        this.set('day', newFormat);
    }),

    initMonth: Ember.on('init', Ember.observer('timestamp', function() {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = (momentObj.format('MMM')).toUpperCase();

        this.set('month', newFormat);
    })),

    observesMonth: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = (momentObj.format('MMM')).toUpperCase();

        this.set('month', newFormat);
    }),

    initYear: Ember.on('init', Ember.observer('timestamp', function() {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('YYYY');

        this.set('year', newFormat);
    })),

    observesYear: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('YYYY');

        this.set('year', newFormat);
    }),

    initMonthYear: Ember.on('init', Ember.observer('calenderTimestamp', function() {
        let time = this.get('calenderTimestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('MMMM YYYY');

        this.set('monthYear', newFormat);
    })),

    observesMonthYear: Ember.observer('calenderTimestamp', function()
    {
        let time = this.get('calenderTimestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('MMMM YYYY');

        this.set('monthYear', newFormat);
    }),

    actions: {

        dayClicked(day)
        {
            let newDay = day.date();
            let newMonth = day.month();
            let newYear = day.year();

            let timestamp = moment(this.get('timestamp'));
                timestamp.date(newDay);
                timestamp.month(newMonth);
                timestamp.year(newYear);

            let reverse = timestamp.unix() * 1000;

            this.set('timestamp', reverse);
        },

        subtractMonth()
        {
            let timestamp = this.get('calenderTimestamp');
            let object = moment(timestamp);
            let subtract = object.subtract('1', 'months');
            let reverse = subtract.unix() * 1000;

            this.set('calenderTimestamp', reverse);
        },

        addMonth()
        {
            let timestamp = this.get('calenderTimestamp');
            let object = moment(timestamp);
            let add = object.add('1', 'months');
            let reverse = add.unix() * 1000;

            this.set('calenderTimestamp', reverse);
        },

        subtractYear()
        {
            let timestamp = this.get('timestamp');
            let object = moment(timestamp);
            let subtract = object.subtract('1', 'years');
            let reverse = subtract.unix() * 1000;

            this.set('timestamp', reverse);
        },

        addYear()
        {
            let timestamp = this.get('timestamp');
            let object = moment(timestamp);
            let add = object.add('1', 'years');
            let reverse = add.unix() * 1000;

            this.set('timestamp', reverse);
        },
    }
});
