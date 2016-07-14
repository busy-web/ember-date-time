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

    /**
     * sets the calenderTimestamp to the timestamp
     *
     * @public
     */
    resetCalenderTimestamp: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');

        this.set('calenderTimestamp', time);
    }),

    /**
     * makes moment objects for each day in month, disables them if they exceed max/min date
     *
     * @public
     */
    buildDaysArrayForMonth: Ember.on('init', Ember.observer('calenderTimestamp', function() {

        let current = moment(this.get('calenderTimestamp'));

        let daysArray = Ember.A();
        let firstDay = current.clone().startOf('month').hour(current.hour()).minute(current.minute());
        let lastDay = current.clone().endOf('month').hour(current.hour()).minute(current.minute());
        let currentDay = firstDay;

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

    /**
     * builds an array of days in a month, starting at sunday
     *
     * @public
     */
    buildCompleteArray: Ember.observer('daysArray', function()
    {
        let nullHeadLength = 0;
        let monthArrayLength = 42;
        let daysArray = this.get('daysArray');
        let firstDayPosition = daysArray.get('firstObject').day();
        let numberOfDays = daysArray.get('length');

        let completeArray = [];

        for (let i=0; i<firstDayPosition; i++) {
            nullHeadLength++;
            completeArray.push(null);
        }

        daysArray.forEach(function(day)
        {
            completeArray.push(day);
        });

        let nullTailLength = monthArrayLength - nullHeadLength - numberOfDays;

        for (let x=0; x<nullTailLength; x++) {
            nullHeadLength++;
            completeArray.push(null);
        }
        this.set('completeArray', completeArray);
    }),

    /**
     * groups days into week objects
     *
     * @public
     */
    groupByWeeks: Ember.observer('completeArray', function()
    {
        let array = this.get('completeArray');
        let grouped = Ember.A([]);

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

    /**
     * observes timestamp and sets the dayOfWeek field
     *
     * @public
     */
    dayOfWeekObserver: Ember.on('init', Ember.observer('timestamp', function() {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('dddd');

        this.set('dayOfWeek', newFormat);
    })),

    /**
     * observes timestamp and sets the day field
     *
     * @public
     */
    dayObserver: Ember.on('init', Ember.observer('timestamp', function() {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('DD');

        this.set('day', newFormat);
    })),

    /**
     * observes timestamp and sets the month field
     *
     * @public
     */
    monthObserver: Ember.on('init', Ember.observer('timestamp', function() {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = (momentObj.format('MMM')).toUpperCase();

        this.set('month', newFormat);
    })),

    /**
     * observes timestamp and sets the year field
     *
     * @public
     */
    yearObserver: Ember.on('init', Ember.observer('timestamp', function() {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('YYYY');

        this.set('year', newFormat);
    })),

    /**
     * observes timestamp and sets the monthYear field
     *
     * @public
     */
    monthYearObserver: Ember.on('init', Ember.observer('calenderTimestamp', function() {
        let time = this.get('calenderTimestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('MMMM YYYY');

        this.set('monthYear', newFormat);
    })),

    /**
     * converts moment object to timestamp and sets it to the global timestamp
     *
     * @public
     */
    setTimestamp: function(moment)
    {
        let reverse = moment.unix() * 1000;
        this.set('timestamp', reverse);
    },

    /**
     * converts moment object to timestamp and sets it to calenderTimestamp
     *
     * @public
     */
    setCalenderTimestamp: function(moment)
    {
        let reverse = moment.unix() * 1000;
        this.set('calenderTimestamp', reverse);
    },

    actions: {

        /**
         * sets the timestamp to the clicked day
         *
         * @public
         */
        dayClicked(day)
        {
            let newDay = day.date();
            let newMonth = day.month();
            let newYear = day.year();

            let timestamp = moment(this.get('timestamp'));
                timestamp.date(newDay);
                timestamp.month(newMonth);
                timestamp.year(newYear);

            this.setTimestamp(timestamp);
        },

        /**
         * subtracts 1 month to the calenderTimestamp
         *
         * @public
         */
        subtractMonth()
        {
            let timestamp = moment(this.get('calenderTimestamp'));
            let subtract = timestamp.subtract('1', 'months');

            this.setCalenderTimestamp(subtract);
        },

        /**
         * adds 1 month to the calenderTimestamp
         *
         * @public
         */
        addMonth()
        {
            let timestamp = moment(this.get('calenderTimestamp'));
            let add = timestamp.add('1', 'months');

            this.setCalenderTimestamp(add);
        }
    }
});
