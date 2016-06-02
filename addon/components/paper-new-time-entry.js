import Ember from 'ember';
import layout from '../templates/components/paper-new-time-entry';
import moment from 'moment';

export default Ember.Component.extend({

    classNames: ['paper-new-time-entry'],
    layout: layout,

    inTimestamp: null,
    outTimestamp: null,

    init: function()
    {
        this._super();

        var now = moment();
        // console.log(now.hour(), now.date());
        this.set('inTimestamp', now);
    },

    clockInMinutes: Ember.computed('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        return time.minutes();
    }),

    clockInHours: Ember.computed('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        return time.hour();
    }),

    clockInDays: Ember.computed('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        return time.date();
    }),

    clockInMonths: Ember.computed('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        return time.month();
    }),

    clockInYears: Ember.computed('inTimestamp', function()
    {
        var time = this.get('inTimestamp');
        return time.year();
    }),



    actions: {
        addMinutes: function()
        {

        },

        addHours: function()
        {

        },

        addDays: function(value, event)
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                this.set('inTimestamp', time.add(1, 'days'));
            }
            if (code === 40)
            {
                this.set('inTimestamp', time.subtract(1, 'days'));
            }
            console.log(time);
        },

        addMonths: function()
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                this.set('inTimestamp', time.add(1, 'months'));
            }
            if (code === 40)
            {
                this.set('inTimestamp', time.subtract(1, 'months'));
            }
            console.log(time);
        },

        addYears: function()
        {
            var time = this.get('inTimestamp');
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                this.set('inTimestamp', time.add(1, 'years'));
            }
            if (code === 40)
            {
                this.set('inTimestamp', time.subtract(1, 'years'));
            }
            console.log(time);
        }
    }
});
