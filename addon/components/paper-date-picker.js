import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/paper-date-picker';

export default Ember.Component.extend({
    classNames: ['paper-date-picker'],
    layout: layout,

    timestamp: null,
    minDate: null,
    maxDate: null,

    day: null,
    month: null,
    year: null,

    init: function()
    {
        this._super();

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

    actions: {

        subtractMonth()
        {
            let timestamp = this.get('timestamp');
            let object = moment(timestamp);
            let subtract = object.subtract('1', 'months');
            let reverse = subtract.unix() * 1000;

            this.set('timestamp', reverse);
        },

        addMonth()
        {
            let timestamp = this.get('timestamp');
            let object = moment(timestamp);
            let add = object.add('1', 'months');
            let reverse = add.unix() * 1000;

            this.set('timestamp', reverse);
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
