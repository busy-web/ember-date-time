/**
 * @module Components
 *
 */
import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/paper-date-picker';

/**
 * `Component/PaperDatePicker`
 *
 * @class PaperDatePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({

    /**
     * @private
     * @property classNames
     * @type String
     * @default paper-date-picker
     */
    classNames: ['paper-date-picker'],
    layout: layout,

    /**
     * timestamp that is passed in when using date picker
     *
     * @private
     * @property timestamp
     * @type Number
     */
    timestamp: null,

    /**
     * timestamp that controls the dates for the calender
     *
     * @private
     * @property calenderTimestamp
     * @type Number
     */
    calenderTimestamp: null,

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
     * day of the month shown on the calender header - based off timestamp
     *
     * @private
     * @property day
     * @type String
     */
    day: null,

    /**
     * month of year shown on the calender header - based off timestamp
     *
     * @private
     * @property month
     * @type String
     */
    month: null,

    /**
     * year shown on the calender header - based off timestamp
     *
     * @private
     * @property year
     * @type String
     */
    year: null,

    /**
     * month + year string - based off calenderTimestamp
     *
     * @private
     * @property monthYear
     * @type String
     */
    monthYear: null,

    /**
     * array of all days in the current month of calenderTimestamp
     *
     * @private
     * @property daysArray
     * @type Array
     */
    daysArray: null,

    /**
     * based on daysArray, Adds blank days to the front and back of array according to starting day of month
     *
     * @private
     * @property completeDaysArray
     * @type Array
     */
    completeDaysArray: null,

    /**
     * based on completeDaysArray, Adds current day and minDate - maxDate properties
     *
     * @private
     * @property completeArray
     * @type Array
     */
    completeArray: null,

    /**
     * based on completeArray, groups days into 6 week arrays
     *
     * @private
     * @property groupedArray
     * @type Array
     */
    groupedArray: null,

    /**
     * @private
     * @method init
     * @constructor
     */
    init: function()
    {
        this._super();
        this.set('calenderTimestamp', this.get('timestamp'));
    },

    /**
     * sets the calenderTimestamp to the timestamp
     *
     * @private
     * @method resetCalenderTimestamp
     */
    resetCalenderTimestamp: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');

        this.set('calenderTimestamp', time);
    }),

    /**
     * makes moment objects for each day in month, disables them if they exceed max/min date
     *
     * @private
     * @method buildDaysArrayForMonth
     */
    buildDaysArrayForMonth: Ember.on('init', Ember.observer('calenderTimestamp', function() {

        let current = moment(this.get('calenderTimestamp'));

        let daysArray = Ember.A();
        let firstDay = current.clone().startOf('month').hour(current.hour()).minute(current.minute());
        let lastDay = current.clone().endOf('month').hour(current.hour()).minute(current.minute());
        let currentDay = firstDay;

        let minDate = this.get('minDate');
        let maxDate = this.get('maxDate');

        while (currentDay.isBefore(lastDay)) {
            if (!Ember.isNone(minDate) || !Ember.isNone(maxDate))
            {
                if (!Ember.isNone(minDate) && Ember.isNone(maxDate))
                {
                    if (!currentDay.isBefore(moment(minDate)))
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

                if (Ember.isNone(minDate) && !Ember.isNone(maxDate))
                {
                    if (!currentDay.isAfter(moment(maxDate)))
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

                if (!Ember.isNone(minDate) && !Ember.isNone(maxDate))
                {
                    if (!currentDay.isBefore(moment(minDate)) && !currentDay.isAfter(moment(maxDate)))
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
     * sets active to the current active day
     *
     * @private
     * @method currentDayOnCalender
     */
    currentDayOnCalender: Ember.observer('daysArray', function()
    {
        let completeDaysArray = [];
        let list = this.get('daysArray');
        let timestamp = moment(this.get('timestamp'));

        list.forEach((item) => {
            let startItem = item.clone();
            let endItem = item.clone().endOf('day');
            let startOfDay = startItem.startOf('day');
            let endOfDay = endItem.endOf('day');

            if (timestamp.isBetween(startOfDay, endOfDay))
            {
                item.isCurrentDay = true;
                completeDaysArray.push(item);
            }
            else
            {
                item.isCurrentDay = false;
                completeDaysArray.push(item);
            }
        });

        this.set('completeDaysArray', completeDaysArray);
    }),

    /**
     * builds an array of days in a month, starting at sunday
     *
     * @private
     * @method buildCompleteArray
     */
    buildCompleteArray: Ember.observer('completeDaysArray', function()
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
     * @private
     * @method groupByWeeks
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

    /**
     * puts days into week objects
     *
     * @private
     * @method inRange
     * @param lower {number} first number in week
     * @param upper {number} last number in week
     * @return {boolean} true if day is in week, otherwise false
     */
    inRange: function(lower, upper)
    {
        return function (each, index) {
            return (index >= lower && index < upper);
        };
    },

    /**
     * observes timestamp and sets the header fields
     *
     * @private
     * @method calenderHeaderValues
     */
    calenderHeaderValues: Ember.on('init', Ember.observer('timestamp', function() {
        let time = moment(this.get('timestamp'));
        let year = time.format('YYYY');
        let month = (time.format('MMM')).toUpperCase();
        let day = time.format('DD');
        let dayOfWeek = time.format('dddd');

        this.set('year', year);
        this.set('month', month);
        this.set('day', day);
        this.set('dayOfWeek', dayOfWeek);
    })),

    /**
     * observes calenderTimestamp and sets the monthYear field
     *
     * @private
     * @method monthYearObserver
     */
    monthYearObserver: Ember.on('init', Ember.observer('calenderTimestamp', function() {
        let time = moment(this.get('calenderTimestamp'));
        let newFormat = time.format('MMMM YYYY');

        this.set('monthYear', newFormat);
    })),

    /**
     * receives a moment object and sets it to timestamp
     *
     * @private
     * @method setTimestamp
     * @param moment {object} a moment object
     */
    setTimestamp: function(moment)
    {
        let reverse = moment.unix() * 1000;
        this.set('timestamp', reverse);
    },

    /**
     * receives a moment object and sets it to calenderTimestamp
     *
     * @private
     * @method setCalenderTimestamp
     * @param moment {object} a moment object
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
         * @param day {object} moment object of the clicked day
         * @event dayClicked
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
         * @event subtractMonth
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
         * @event addMonth
         */
        addMonth()
        {
            let timestamp = moment(this.get('calenderTimestamp'));
            let add = timestamp.add('1', 'months');

            this.setCalenderTimestamp(add);
        }
    }
});
