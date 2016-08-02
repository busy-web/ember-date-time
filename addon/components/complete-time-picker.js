/**
 * @module Components
 *
 */
import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/complete-time-picker';

/**
 * `Component/CompleteTimePicker`
 *
 * @class CompleteTimePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({

    /**
     * @private
     * @property classNames
     * @type String
     * @default complete-time-picker
     */
    classNames: ['complete-time-picker'],
    layout: layout,

    /**
     * timestamp that is passed in when using complete-time-picker
     *
     * @private
     * @property timestamp
     * @type Number
     */
    timestamp: null,

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
     * boolean based on if the clock or calender is showing
     *
     * @private
     * @property isClock
     * @type Boolean
     */
    isClock: true,

    /**
     * boolean based on if the clock or calender is showing
     *
     * @private
     * @property isCalender
     * @type Boolean
     */
    isCalender: false,

    /**
     * String as the current date of the timestamp
     *
     * @private
     * @property currentDate
     * @type String
     */
    currentDate: null,

    /**
     * String as the current time of the timestamp
     *
     * @private
     * @property currentTime
     * @type String
     */
    currentTime: null,

    /**
     * sets currentTime and currentDate, sets a timestamp to now if a timestamp wasnt passed in
     * @private
     * @method init
     * @constructor
     */
    init: function()
    {
        this._super();
        if (Ember.isNone(this.get('timestamp')))
        {
            let now = moment();
            let back = now.unix() * 1000;

            this.set('timestamp', back);
        }

        let time = this.get('timestamp');
        let momentObj = moment(time);

        let currentDate = momentObj.format('MMM DD, YYYY');
        this.set('currentDate', currentDate);

        let currentTime = momentObj.format('hh:mm A');
        this.set('currentTime', currentTime);
    },

    /**
     * sets/resets currentDate whenever timestamp changes
     *
     * @private
     * @method observesCurrentDate
     */
    observesCurrentDate: Ember.observer('timestamp', function()
    {
        let time = moment(this.get('timestamp'));
        let newFormat = time.format('MMM DD, YYYY');

        this.set('currentDate', newFormat);
    }),

    /**
     * sets/resets currentTime whenever timestamp changes
     *
     * @private
     * @method observesCurrentTime
     */
    observesCurrentTime: Ember.observer('timestamp', function()
    {
        let time = moment(this.get('timestamp'));
        let newFormat = time.format('hh:mm A');

        this.set('currentTime', newFormat);
    }),

    actions: {

        /**
         * changes dialog from clock to calender and vice versa
         *
         * @event togglePicker
         */
        togglePicker: function(current)
        {
            if (current === 'isClock')
            {
                this.set('isClock', false);
                this.set('isCalender', true);
            }
            else
            {
                this.set('isClock', true);
                this.set('isCalender', false);
            }
        }
    }
});
