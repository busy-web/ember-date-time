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
        // let min = ((moment().subtract('days', 1).subtract('hours', 2).subtract('minutes', 10)).unix()) * 1000;
        let max = ((moment().add('days', 1).subtract('hours', 6).subtract('minutes', 30)).unix()) * 1000;

        // this.set('minDate', min);
        this.set('maxDate', max);


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
        console.log('here', newFormat);
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
