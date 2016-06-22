import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/complete-time-picker';

export default Ember.Component.extend({
    classNames: ['complete-time-picker'],
    layout: layout,

    isClock: true,
    isCalender: false,

    timestamp: null,

    currentDate: null,
    currentTime: null,

    init: function()
    {
        this._super();

        var time = this.get('timestamp');
        var momentObj = moment(time);

        var currentDate = momentObj.format('MMM DD, YYYY');
        this.set('currentDate', currentDate);

        var currentTime = momentObj.format('HH:mm A');
        this.set('currentTime', currentTime);
    },

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
