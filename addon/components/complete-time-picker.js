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

		// TODO:
		//
		// This code is a repeated 3 times in this file.
		// This should be moved to one observer function and then
		// call that method on init so that it can be set initially.
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
		// TODO:
		//
		// There should be some check in place here to make sure that
		// this.get('timestamp') is a number before you pass it to moment and
		// expect that it will work out okay. The folowing code would check if the
		// timestamp is set and set to the proper type then convert it to moment and finally
		// check if it got a valid moment date from the timestamp. If timestamp is meant to be
		// required then remove the if statement and remove the Ember.isNone from the first assert.
		//
		// this could change to:
		// ```
		// // assert timestamp is a number or timestamp is null or undefined
		// Ember.assert("timestamp must be a valid unix timestamp", Ember.isNone(this.get('timestamp')) || typeof this.get('timestamp') === 'number');
		//
		// // set time to a moment date incase
		// // the timestamp is null or undefined.
		// let time = moment();
		//
		// // if timestamp is set.
		// if (!Ember.isNone(this.get('timestamp'))) {
		//	 // convert the timestamp to a moment date
		//	 time = moment(this.get('timestamp'));
		//
		//	 // assert the moment date is a valid date
		//	 Ember.assert("timestamp must be a valid unix timestamp", moment.isMoment(time) && time.isValid());
		// }
		//
		// // set the currentDate
		// this.set('currentDate', time.format('MMM DD, YYYY'));
		//
		// // set the currentTime
		// this.set('currentTime', time.format('hh:mm A'));
		// ```
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
		// TODO:
		// These variables are never changed after they are set
		// so these should be set to const instead of let.
		//
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
			// TODO:
			//
			// this is fine the way its wriiten but I just wanted to give
			// you another ooption here. Instead of the if else here thes could be wriiten
			// without that with just:
			//  ```
			//  const isClock = (current === 'isClock');
			//  this.set('isClock', isClock);
			//  this.set('isCalender', !isClock);
			//  ```
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
