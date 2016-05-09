import Ember from 'ember';
import layout from '../templates/components/paper-time-picker';

export default Ember.Component.extend(
{
    classNames: ['paper-time-picker'],

    layout: layout,

    rotateCircle: null,

    actions: {

        amClicked: function()
        {

        },

        pmClicked: function()
        {

        },

        drag: function() {
            console.log('making it');
            // this.set('rotateCircle', 'animation: circle 15s linear infinite;');
        },

        hourOne: function()
        {
            this.set('rotateCircle', 'animation: circle 15s linear infinite;')
        },

        hourTwo: function()
        {

        },

        hourThree: function()
        {

        },

        hourFour: function()
        {

        },

        hourFive: function()
        {

        },

        hourSix: function()
        {

        },

        hourSeven: function()
        {

        },

        hourEight: function()
        {

        },

        hourNine: function()
        {

        },

        hourTen: function()
        {

        },

        hourEleven: function()
        {

        },

        hourTwelve: function()
        {

        },
    }
});
