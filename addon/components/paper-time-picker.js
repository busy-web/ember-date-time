import Ember from 'ember';
import layout from '../templates/components/paper-time-picker';
import Snap from 'snap-svg';
import mina from 'mina';

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
        this.changesClock();
        var _this = this;
        var clock = Snap('#clocks-hour-svg');

        // hour 01 - line & circle
        var hour01 = clock.select('#hour01');
        var line01 = clock.select('#line01');
        var circle01 = clock.select('#circle01');

        // makes hour 01 active
        var hour01clicked = function(event){
            _this.removeOtherActives('hour01', 'line01', 'circle01');
            line01.appendTo(clock);
            circle01.appendTo(clock);
            hour01.addClass('interiorWhite');
            hour01.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour01.click(hour01clicked);

        var start = function() {
            this.ox = parseInt(this.attr("cx"));
            this.oy = parseInt(this.attr("cy"));
            console.log("Start move, ox=" + this.ox + ", oy=" + this.oy);
        }

        var move = function(dx, dy) {
            console.log('1', dx, dy);
            this.attr({"cx": this.ox + dx, "cy": this.oy + dy});
            console.log('2', dx, dy);
        }

        var stop = function() {
            this.ox = parseInt(this.attr("cx"));
            this.oy = parseInt(this.attr("cy"));
            console.log("Stop move, ox=" + this.ox + ", oy=" + this.oy);
        }

        circle01.drag(move, start, stop);

        // hour 02 - line & circle
        var hour02 = clock.select('#hour02');
        var line02 = clock.select('#line02');
        var circle02 = clock.select('#circle02');

        // makes hour 02 active
        var hour02clicked = function(event){
            _this.removeOtherActives('hour02', 'line02', 'circle02');
            line02.appendTo(clock);
            circle02.appendTo(clock);
            hour02.addClass('interiorWhite');
            hour02.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour02.click(hour02clicked);


        // hour 03 - line & circle
        var hour03 = clock.select('#hour03');
        var line03 = clock.select('#line03');
        var circle03 = clock.select('#circle03');

        // makes hour 03 active
        var hour03clicked = function(event){
            _this.removeOtherActives('hour03', 'line03', 'circle03');
            line03.appendTo(clock);
            circle03.appendTo(clock);
            hour03.addClass('interiorWhite');
            hour03.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour03.click(hour03clicked);

        // hour 04 - line & circle
        var hour04 = clock.select('#hour04');
        var line04 = clock.select('#line04');
        var circle04 = clock.select('#circle04');

        // makes hour 04 active
        var hour04clicked = function(event){
            _this.removeOtherActives('hour04', 'line04', 'circle04');
            line04.appendTo(clock);
            circle04.appendTo(clock);
            hour04.addClass('interiorWhite');
            hour04.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour04.click(hour04clicked);

        // hour 05 - line & circle
        var hour05 = clock.select('#hour05');
        var line05 = clock.select('#line05');
        var circle05 = clock.select('#circle05');

        // makes hour 05 active
        var hour05clicked = function(event){
            _this.removeOtherActives('hour05', 'line05', 'circle05');
            line05.appendTo(clock);
            circle05.appendTo(clock);
            hour05.addClass('interiorWhite');
            hour05.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour05.click(hour05clicked);

        // hour 06 - line & circle
        var hour06 = clock.select('#hour06');
        var line06 = clock.select('#line06');
        var circle06 = clock.select('#circle06');

        // makes hour 06 active
        var hour06clicked = function(event){
            _this.removeOtherActives('hour06', 'line06', 'circle06');
            line06.appendTo(clock);
            circle06.appendTo(clock);
            hour06.addClass('interiorWhite');
            hour06.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour06.click(hour06clicked);

        // hour 07 - line & circle
        var hour07 = clock.select('#hour07');
        var line07 = clock.select('#line07');
        var circle07 = clock.select('#circle07');

        // makes hour 07 active
        var hour07clicked = function(event){
            _this.removeOtherActives('hour07', 'line07', 'circle07');
            line07.appendTo(clock);
            circle07.appendTo(clock);
            hour07.addClass('interiorWhite');
            hour07.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour07.click(hour07clicked);

        // hour 08 - line & circle
        var hour08 = clock.select('#hour08');
        var line08 = clock.select('#line08');
        var circle08 = clock.select('#circle08');

        // makes hour 08 active
        var hour08clicked = function(event){
            _this.removeOtherActives('hour08', 'line08', 'circle08');
            line08.appendTo(clock);
            circle08.appendTo(clock);
            hour08.addClass('interiorWhite');
            hour08.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour08.click(hour08clicked);

        // hour 09 - line & circle
        var hour09 = clock.select('#hour09');
        var line09 = clock.select('#line09');
        var circle09 = clock.select('#circle09');

        // makes hour 09 active
        var hour09clicked = function(event){
            _this.removeOtherActives('hour09', 'line09', 'circle09');
            line09.appendTo(clock);
            circle09.appendTo(clock);
            hour09.addClass('interiorWhite');
            hour09.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour09.click(hour09clicked);

        // hour 10 - line & circle
        var hour10 = clock.select('#hour10');
        var line10 = clock.select('#line10');
        var circle10 = clock.select('#circle10');

        // makes hour 09 active
        var hour10clicked = function(event){
            _this.removeOtherActives('hour10', 'line10', 'circle10');
            line10.appendTo(clock);
            circle10.appendTo(clock);
            hour10.addClass('interiorWhite');
            hour10.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour10.click(hour10clicked);

        // hour 11 - line & circle
        var hour11 = clock.select('#hour11');
        var line11 = clock.select('#line11');
        var circle11 = clock.select('#circle11');

        // makes hour 11 active
        var hour11clicked = function(event){
            _this.removeOtherActives('hour11', 'line11', 'circle11');
            line11.appendTo(clock);
            circle11.appendTo(clock);
            hour11.addClass('interiorWhite');
            hour11.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour11.click(hour11clicked);

        // hour 12 - line & circle
        var hour12 = clock.select('#hour12');
        var line12 = clock.select('#line12');
        var circle12 = clock.select('#circle12');

        // makes hour 09 active
        var hour12clicked = function(event){
            _this.removeOtherActives('hour12', 'line12', 'circle12');
            line12.appendTo(clock);
            circle12.appendTo(clock);
            hour12.addClass('interiorWhite');
            hour12.animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        };

        hour12.click(hour12clicked);
    },

    removeOtherActives: function(activeHour, activeLine, activeCircle)
    {
        // get the whole clock canvas
        var clock = Snap('#clocks-hour-svg');

        var bigCircle = clock.select('#bigCircle');

        // hour 01 - line & circle
        var hour01 = clock.select('#hour01');
        var line01 = clock.select('#line01');
        var circle01 = clock.select('#circle01');
        hour01.removeClass('interiorWhite');
        line01.insertBefore(bigCircle);
        circle01.insertBefore(bigCircle);

        // hour 02 - line & circle
        var hour02 = clock.select('#hour02');
        var line02 = clock.select('#line02');
        var circle02 = clock.select('#circle02');
        hour02.removeClass('interiorWhite');
        line02.insertBefore(bigCircle);
        circle02.insertBefore(bigCircle);

        // hour 03 - line & circle
        var hour03 = clock.select('#hour03');
        var line03 = clock.select('#line03');
        var circle03 = clock.select('#circle03');
        hour03.removeClass('interiorWhite');
        line03.insertBefore(bigCircle);
        circle03.insertBefore(bigCircle);

        // hour 04 - line & circle
        var hour04 = clock.select('#hour04');
        var line04 = clock.select('#line04');
        var circle04 = clock.select('#circle04');
        hour04.removeClass('interiorWhite');
        line04.insertBefore(bigCircle);
        circle04.insertBefore(bigCircle);

        // hour 05 - line & circle
        var hour05 = clock.select('#hour05');
        var line05 = clock.select('#line05');
        var circle05 = clock.select('#circle05');
        hour05.removeClass('interiorWhite');
        line05.insertBefore(bigCircle);
        circle05.insertBefore(bigCircle);

        // hour 06 - line & circle
        var hour06 = clock.select('#hour06');
        var line06 = clock.select('#line06');
        var circle06 = clock.select('#circle06');
        hour06.removeClass('interiorWhite');
        line06.insertBefore(bigCircle);
        circle06.insertBefore(bigCircle);

        // hour 07 - line & circle
        var hour07 = clock.select('#hour07');
        var line07 = clock.select('#line07');
        var circle07 = clock.select('#circle07');
        hour07.removeClass('interiorWhite');
        line07.insertBefore(bigCircle);
        circle07.insertBefore(bigCircle);

        // hour 08 - line & circle
        var hour08 = clock.select('#hour08');
        var line08 = clock.select('#line08');
        var circle08 = clock.select('#circle08');
        hour08.removeClass('interiorWhite');
        line08.insertBefore(bigCircle);
        circle08.insertBefore(bigCircle);
        // hour 09 - line & circle
        var hour09 = clock.select('#hour09');
        var line09 = clock.select('#line09');
        var circle09 = clock.select('#circle09');
        hour09.removeClass('interiorWhite');
        line09.insertBefore(bigCircle);
        circle09.insertBefore(bigCircle);

        // hour 10 - line & circle
        var hour10 = clock.select('#hour10');
        var line10 = clock.select('#line10');
        var circle10 = clock.select('#circle10');
        hour10.removeClass('interiorWhite');
        line10.insertBefore(bigCircle);
        circle10.insertBefore(bigCircle);

        // hour 11 - line & circle
        var hour11 = clock.select('#hour11');
        var line11 = clock.select('#line11');
        var circle11 = clock.select('#circle11');
        hour11.removeClass('interiorWhite');
        line11.insertBefore(bigCircle);
        circle11.insertBefore(bigCircle);

        // hour 12 - line & circle
        var hour12 = clock.select('#hour12');
        var line12 = clock.select('#line12');
        var circle12 = clock.select('#circle12');
        hour12.removeClass('interiorWhite');
        line12.insertBefore(bigCircle);
        circle12.insertBefore(bigCircle);

        clock.select('#' + activeHour).addClass('interiorWhite');
        clock.select('#' + activeLine).appendTo(clock);
        clock.select('#' + activeCircle).appendTo(clock);
        clock.select('#' + activeHour).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

        this.set('activeHour', activeHour);
    },


    changesClock: function()
    {
        if(!Ember.isNone(this.get('time')))
        {
            var time = this.get('time');

            // Create a new JavaScript Date object based on the timestamp
            // multiplied by 1000 so that the argument is in milliseconds, not seconds.
            var date = new Date(time*1000);
            // Hours part from the timestamp
            var hours = date.getHours();
            // Minutes part from the timestamp
            var minutes = "0" + date.getMinutes();
            // Seconds part from the timestamp
            var seconds = "0" + date.getSeconds();

            var activeHour = hours%12;
            var hour = 'hour' + activeHour;
            var line = 'line' + activeHour;
            var circle = 'circle' + activeHour;

            var newHour = hour.replace(/"/g, "");
            console.log(newHour);
            this.removeOtherActives(newHour, line, circle);

        }
        else {
            var date = new Date();
        }

    },

    actions: {

        amClicked: function()
        {

        },

        pmClicked: function()
        {

        }
    }
});
