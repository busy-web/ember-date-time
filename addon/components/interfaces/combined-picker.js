/**
 * @module Components
 *
 */
import Ember from 'ember';
import moment from 'moment';
import layout from '../../templates/components/interfaces/combined-picker';

/**
 * `Component/CompinedPicker`
 *
 * @class CombinedPicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({

    /**
     * @private
     * @property classNames
     * @type String
     * @default combined-picker
     */
    classNames: ['combined-picker'],
    layout: layout,

    /**
     * timestamp that is passed in when using combined-picker
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
        this.observesDateTime();
    },

    /**
     * sets/resets currentDate whenever timestamp changes
     *
     * @private
     * @method observesCurrentDate
     */
    observesDateTime: Ember.observer('timestamp', function()
    {
        Ember.assert("timestamp must be a valid unix timestamp", Ember.isNone(this.get('timestamp')) || typeof this.get('timestamp') === 'number');

        let time = moment();

        if (!Ember.isNone(this.get('timestamp'))) {

          time = moment(this.get('timestamp'));
          Ember.assert("timestamp must be a valid unix timestamp", moment.isMoment(time) && time.isValid());
        }

        this.set('currentDate', time.format('MMM DD, YYYY'));
        this.set('currentTime', time.format('hh:mm A'));
    }),

    actions: {

        /**
         * changes dialog from clock to calender and vice versa
         *
         * @event togglePicker
         */
        togglePicker: function(current)
        {
           const isClock = (current === 'isClock');
           this.set('isClock', !isClock);
           this.set('isCalender', isClock);
        }
    }
});
