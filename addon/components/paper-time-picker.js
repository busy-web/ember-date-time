import Ember from 'ember';
import layout from '../templates/components/paper-time-picker';
import Snap from 'snap-svg';

export default Ember.Component.extend(
{
    classNames: ['paper-time-picker'],

    layout: layout,

    rotateCircle: null,

    time: 1462080332, //may 5 2016, 5 am

    activeHour: null,

    didInsertElement: function()
    {
        this._super();
        var clock = Snap('#clocks-hour-svg');

        // hour 01 - line & circle
        var hour01 = clock.select('#hour01');
        var line01 = clock.select('#line01');
        var circle01 = clock.select('#circle01');

        // makes hour 01 active
        var hour01clicked = function(event){
            // this.removeOtherActives('hour01', 'line01', 'circle01');
            line01.appendTo(clock);
            circle01.appendTo(clock);
            hour01.addClass('interiorWhite');
            hour01.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour01.click(hour01clicked);

        // hour 02 - line & circle
        var hour02 = clock.select('#hour02');
        var line02 = clock.select('#line02');
        var circle02 = clock.select('#circle02');

        // makes hour 02 active
        var hour02clicked = function(event){
            this.removeOtherActives('hour02');
            // line02.appendTo(clock);
            // circle02.appendTo(clock);
            hour02.addClass('interiorWhite');
            hour02.animate({stroke: "white", strokeWidth: "1"}, 100, mina.easein).appendTo(clock);
        };

        hour02.click(hour02clicked);


        // hour 03 - line & circle
        var hour03 = clock.select('#hour03');
        var line03 = clock.select('#line03');
        var circle03 = clock.select('#circle03');

        // hour 04 - line & circle
        var hour04 = clock.select('#hour04');
        var line04 = clock.select('#line04');
        var circle04 = clock.select('#circle04');

        // hour 05 - line & circle
        var hour05 = clock.select('#hour05');
        var line05 = clock.select('#line05');
        var circle05 = clock.select('#circle05');

        // hour 06 - line & circle
        var hour06 = clock.select('#hour06');
        var line06 = clock.select('#line06');
        var circle06 = clock.select('#circle06');

        // hour 07 - line & circle
        var hour07 = clock.select('#hour07');
        var line07 = clock.select('#line07');
        var circle07 = clock.select('#circle07');

        // hour 08 - line & circle
        var hour08 = clock.select('#hour08');
        var line08 = clock.select('#line08');
        var circle08 = clock.select('#circle08');

        // hour 09 - line & circle
        var hour09 = clock.select('#hour09');
        var line09 = clock.select('#line09');
        var circle09 = clock.select('#circle09');

        // hour 10 - line & circle
        var hour10 = clock.select('#hour10');
        var line10 = clock.select('#line10');
        var circle10 = clock.select('#circle10');

        // hour 11 - line & circle
        var hour11 = clock.select('#hour11');
        var line11 = clock.select('#line11');
        var circle11 = clock.select('#circle11');

        // hour 12 - line & circle
        var hour12 = clock.select('#hour12');
        var line12 = clock.select('#line12');
        var circle12 = clock.select('#circle12');

        var time = this.get('time');
    },

    removeOtherActives: function(activeHour, activeLine, activeCircle)
    {
        // get the whole clock canvas
        var clock = Snap('#clocks-hour-svg');

        // hour 01 - line & circle
        var hour01 = clock.select('#hour01');
        var line01 = clock.select('#line01');
        var circle01 = clock.select('#circle01');

        // hour 02 - line & circle
        var hour02 = clock.select('#hour02');
        var line02 = clock.select('#line02');
        var circle02 = clock.select('#circle02');

        // hour 03 - line & circle
        var hour03 = clock.select('#hour03');
        var line03 = clock.select('#line03');
        var circle03 = clock.select('#circle03');

        // hour 04 - line & circle
        var hour04 = clock.select('#hour04');
        var line04 = clock.select('#line04');
        var circle04 = clock.select('#circle04');

        // hour 05 - line & circle
        var hour05 = clock.select('#hour05');
        var line05 = clock.select('#line05');
        var circle05 = clock.select('#circle05');

        // hour 06 - line & circle
        var hour06 = clock.select('#hour06');
        var line06 = clock.select('#line06');
        var circle06 = clock.select('#circle06');

        // hour 07 - line & circle
        var hour07 = clock.select('#hour07');
        var line07 = clock.select('#line07');
        var circle07 = clock.select('#circle07');

        // hour 08 - line & circle
        var hour08 = clock.select('#hour08');
        var line08 = clock.select('#line08');
        var circle08 = clock.select('#circle08');

        // hour 09 - line & circle
        var hour09 = clock.select('#hour09');
        var line09 = clock.select('#line09');
        var circle09 = clock.select('#circle09');

        // hour 10 - line & circle
        var hour10 = clock.select('#hour10');
        var line10 = clock.select('#line10');
        var circle10 = clock.select('#circle10');

        // hour 11 - line & circle
        var hour11 = clock.select('#hour11');
        var line11 = clock.select('#line11');
        var circle11 = clock.select('#circle11');

        // hour 12 - line & circle
        var hour12 = clock.select('#hour12');
        var line12 = clock.select('#line12');
        var circle12 = clock.select('#circle12');

        activeHour.removeClass('interiorWhite');
        activeHour.animate({stroke: "black", strokeWidth: "0"}, 100, mina.easeout).appendTo(clock);
        // activeLine.remove();
        // activeCircle.remove();

        this.set('activeHour', activeHour);
    },

    actions: {

        amClicked: function()
        {

        },

        pmClicked: function()
        {

        },

        drag: function()
        {
            // get the whole clock canvas
            var clock = Snap('#clocks-hour-svg');

            // hour 01 - line & circle
            var hour01 = clock.select('#hour01');
            var line01 = clock.select('#line01');
            var circle01 = clock.select('#circle01');

            // hour 02 - line & circle
            var hour02 = clock.select('#hour02');
            var line02 = clock.select('#line02');
            var circle02 = clock.select('#circle02');

            // hour 03 - line & circle
            var hour03 = clock.select('#hour03');
            var line03 = clock.select('#line03');
            var circle03 = clock.select('#circle03');

            // hour 04 - line & circle
            var hour04 = clock.select('#hour04');
            var line04 = clock.select('#line04');
            var circle04 = clock.select('#circle04');

            // hour 05 - line & circle
            var hour05 = clock.select('#hour05');
            var line05 = clock.select('#line05');
            var circle05 = clock.select('#circle05');

            // hour 06 - line & circle
            var hour06 = clock.select('#hour06');
            var line06 = clock.select('#line06');
            var circle06 = clock.select('#circle06');

            // hour 07 - line & circle
            var hour07 = clock.select('#hour07');
            var line07 = clock.select('#line07');
            var circle07 = clock.select('#circle07');

            // hour 08 - line & circle
            var hour08 = clock.select('#hour08');
            var line08 = clock.select('#line08');
            var circle08 = clock.select('#circle08');

            // hour 09 - line & circle
            var hour09 = clock.select('#hour09');
            var line09 = clock.select('#line09');
            var circle09 = clock.select('#circle09');

            // hour 10 - line & circle
            var hour10 = clock.select('#hour10');
            var line10 = clock.select('#line10');
            var circle10 = clock.select('#circle10');

            // hour 11 - line & circle
            var hour11 = clock.select('#hour11');
            var line11 = clock.select('#line11');
            var circle11 = clock.select('#circle11');

            // hour 12 - line & circle
            var hour12 = clock.select('#hour12');
            var line12 = clock.select('#line12');
            var circle12 = clock.select('#circle12');

            console.log('work');

            var goTo1 = function(event){
              hour01.animate({stroke: "red", strokeWidth: "10"}, 250, mina.easein).appendTo(clock);
            };

            hour01.click(goTo1)

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
