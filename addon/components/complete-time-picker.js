import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/complete-time-picker';

export default Ember.Component.extend({
    classNames: ['complete-time-picker'],
    layout: layout,

    isClock: true,
    isCalender: false,

    timestamp: null,
    datetime: null,

    currentDate: null,
    currentTime: null,

    minDate: null,
    maxDate: null,

    init: function()
    {
        this._super();

        if (Ember.isNone(this.get('timestamp')))
        {
            let now = moment();
            let back = now.unix() * 1000;

            this.set('timestamp', back);
        }

        // let maxDate = moment().add('minutes', 30);
        let minDate = moment().subtract('minutes', 5);

        this.set('minDate', minDate);
        // this.set('maxDate', maxDate);

        var time = this.get('timestamp');
        var momentObj = moment(time);

        var currentDate = momentObj.format('MMM DD, YYYY');
        this.set('currentDate', currentDate);

        var currentTime = momentObj.format('hh:mm A');
        this.set('currentTime', currentTime);

        var datetime = momentObj.format('MMM DD, YYYY hh:mm A');
        this.set('datetime', datetime);

    },

    observesCurrentDate: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('MMM DD, YYYY');

        this.set('currentDate', newFormat);
    }),

    observesCurrentTime: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('hh:mm A');

        this.set('currentTime', newFormat);
    }),

    observesDateTime: Ember.observer('timestamp', function()
    {
        let time = this.get('timestamp');
        let momentObj = moment(time);
        let newFormat = momentObj.format('MMM DD, YYYY hh:mm A');
        this.set('datetime', newFormat);
    }),

    actions: {

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
