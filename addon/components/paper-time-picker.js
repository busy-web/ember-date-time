import Ember from 'ember';
import layout from '../templates/components/paper-time-picker';
import Snap from 'snap-svg';
import mina from 'mina';

const center_x = 104.75;
const center_y = 105;

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
    },

    drag: function(hour, line, circle)
    {
        var clock = Snap('#clocks-hour-svg');
        var _this = this;

        //move function for dragging
        var move = function(dx,dy,x,y) {
            var endX = x - 133;
            var endY = -(y - 186);
            var startX = endX - dx;
            var startY = endY + dy;

            var slope = (startY/startX);
            var isForward = endY < (slope*endX);

            var angle = _this.angle(endX, endY, startX, startY);

            var last2 = parseInt(hour.slice(-2));
            if (last2 <= 6 || last2 === 12)
            {
                angle = isForward ? angle : -angle;
            }
            else {
                angle = isForward ? -angle : angle;
            }
            this.attr({
                transform: ('r' + angle + ', ' + center_x + ',' + center_y)
            });
        };

        var start = function() {
            this.data('origTransform', this.transform().local );
        };

        var stop = function() {
            var info = this.getBBox();
            var endingX = info.cx;
            var endingY = info.cy;

            var dx = endingX - 104.75;
            var dy = endingY - 105;

            var dxPos = dx < 0 ? 'left' : 'right';
            var dyPos = dy < 0 ? 'top' : 'bottom';

            var hypo = Math.sqrt((dx * dx) + (dy * dy));
            var angle = Math.atan(Math.abs(dx) / Math.abs(dy));
            var degrees = Snap.deg(angle);

            if(dxPos === 'right' && dyPos === 'top')
            {
                if (degrees >= 0 && degrees <= 15)
                {
                    _this.removeOtherActives('hour12', 'line12', 'circle12');
                }
                if (degrees >= 16 && degrees <= 45)
                {
                    _this.removeOtherActives('hour01', 'line01', 'circle01');
                }
                if (degrees >= 46 && degrees <= 75)
                {
                    _this.removeOtherActives('hour02', 'line02', 'circle02');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeOtherActives('hour03', 'line03', 'circle03');
                }
            }

            if(dxPos === 'right' && dyPos === 'bottom')
            {
                if (degrees >= 0 && degrees <= 15)
                {
                    _this.removeOtherActives('hour06', 'line06', 'circle06');
                }
                if (degrees >= 16 && degrees <= 45)
                {
                    _this.removeOtherActives('hour05', 'line05', 'circle05');
                }
                if (degrees >= 46 && degrees <= 75)
                {
                    _this.removeOtherActives('hour04', 'line04', 'circle04');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeOtherActives('hour03', 'line03', 'circle03');
                }
            }

            if(dxPos === 'left' && dyPos === 'bottom')
            {
                if (degrees >= 0 && degrees <= 15)
                {
                    _this.removeOtherActives('hour06', 'line06', 'circle06');
                }
                if (degrees >= 16 && degrees <= 45)
                {
                    _this.removeOtherActives('hour07', 'line07', 'circle07');
                }
                if (degrees >= 46 && degrees <= 75)
                {
                    _this.removeOtherActives('hour08', 'line08', 'circle08');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeOtherActives('hour09', 'line09', 'circle09');
                }
            }

            if(dxPos === 'left' && dyPos === 'top')
            {
                if (degrees >= 0 && degrees <= 15)
                {
                    _this.removeOtherActives('hour12', 'line12', 'circle12');
                }
                if (degrees >= 16 && degrees <= 45)
                {
                    _this.removeOtherActives('hour11', 'line11', 'circle11');
                }
                if (degrees >= 46 && degrees <= 75)
                {
                    _this.removeOtherActives('hour10', 'line10', 'circle10');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeOtherActives('hour09', 'line09', 'circle09');
                }
            }
        };

        var curHour = clock.select('#' + hour);
        var curLine = clock.select('#' + line);
        var curCircle = clock.select('#' + circle);

        var curGroup = clock.g(curLine, curCircle);
        // curHour.drag(move, start, stop);
        curGroup.drag(move, start, stop);
        curGroup.insertBefore(curHour);
    },

    angle: function(x, y, x2, y2)
    {
        let p0 = Math.sqrt(Math.pow(0-x, 2)+Math.pow(0-y, 2));
        let p1 = Math.sqrt(Math.pow(0-x2, 2)+Math.pow(0-y2, 2));
        let p2 = Math.sqrt(Math.pow(x2-x, 2)+Math.pow(y2-y, 2));

        return (Math.acos(((p1*p1)+(p0*p0)-(p2*p2))/(2*(p1*p0)))*360)/(2*Math.PI);
    },

    removeOtherActives: function(activeHour, activeLine, activeCircle)
    {
        var clock = Snap('#clocks-hour-svg');
        var bigCircle = clock.select('#bigCircle');
        var allHours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        allHours.forEach(function(item)
        {
            var newHour = item.replace(/"/g, "");

            var hourSelect = '#hour' + item;
            var lineSelect = '#line' + item;
            var circleSelect = '#circle' + item;

            var hour = clock.select(hourSelect);
            var line = clock.select(lineSelect);
            var circle = clock.select(circleSelect);

            clock.select(hourSelect).removeClass('interiorWhite');
            clock.select(lineSelect).insertBefore(bigCircle);
            clock.select(circleSelect).insertBefore(bigCircle);
        });

        clock.select('#' + activeHour).addClass('interiorWhite');
        clock.select('#' + activeLine).appendTo(clock);
        clock.select('#' + activeCircle).appendTo(clock);
        clock.select('#' + activeHour).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

        this.set('activeHour', activeHour);
        this.drag(activeHour, activeLine, activeCircle);
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

            this.removeOtherActives(newHour, line, circle);
            this.drag(hour, line, circle);

        }
        else {
            var date = new Date();
        }
    },

    actions: {

        click01: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour01 = clock.select('#hour01');
            var line01 = clock.select('#line01');
            var circle01 = clock.select('#circle01');

            this.removeOtherActives('hour01', 'line01', 'circle01');
            line01.appendTo(clock);
            circle01.appendTo(clock);
            hour01.addClass('interiorWhite');
            hour01.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour01', 'line01', 'circle01');
        },

        click02: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour02 = clock.select('#hour02');
            var line02 = clock.select('#line02');
            var circle02 = clock.select('#circle02');

            this.removeOtherActives('hour02', 'line02', 'circle02');
            line02.appendTo(clock);
            circle02.appendTo(clock);
            hour02.addClass('interiorWhite');
            hour02.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour02', 'line02', 'circle02');
        },

        click03: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour03 = clock.select('#hour03');
            var line03 = clock.select('#line03');
            var circle03 = clock.select('#circle03');

            this.removeOtherActives('hour03', 'line03', 'circle03');
            line03.appendTo(clock);
            circle03.appendTo(clock);
            hour03.addClass('interiorWhite');
            hour03.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour03', 'line03', 'circle03');
        },

        click04: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour04 = clock.select('#hour04');
            var line04 = clock.select('#line04');
            var circle04 = clock.select('#circle04');

            this.removeOtherActives('hour04', 'line04', 'circle04');
            line04.appendTo(clock);
            circle04.appendTo(clock);
            hour04.addClass('interiorWhite');
            hour04.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour04', 'line04', 'circle04');
        },

        click05: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour05 = clock.select('#hour05');
            var line05 = clock.select('#line05');
            var circle05 = clock.select('#circle05');

            this.removeOtherActives('hour05', 'line05', 'circle05');
            line05.appendTo(clock);
            circle05.appendTo(clock);
            hour05.addClass('interiorWhite');
            hour05.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour05', 'line05', 'circle05');
        },

        click06: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour06 = clock.select('#hour06');
            var line06 = clock.select('#line06');
            var circle06 = clock.select('#circle06');

            this.removeOtherActives('hour06', 'line06', 'circle06');
            line06.appendTo(clock);
            circle06.appendTo(clock);
            hour06.addClass('interiorWhite');
            hour06.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour06', 'line06', 'circle06');
        },

        click07: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour07 = clock.select('#hour07');
            var line07 = clock.select('#line07');
            var circle07 = clock.select('#circle07');

            this.removeOtherActives('hour07', 'line07', 'circle07');
            line07.appendTo(clock);
            circle07.appendTo(clock);
            hour07.addClass('interiorWhite');
            hour07.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour07', 'line07', 'circle07');
        },

        click08: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour08 = clock.select('#hour08');
            var line08 = clock.select('#line08');
            var circle08 = clock.select('#circle08');

            this.removeOtherActives('hour08', 'line08', 'circle08');
            line08.appendTo(clock);
            circle08.appendTo(clock);
            hour08.addClass('interiorWhite');
            hour08.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour08', 'line08', 'circle08');
        },

        click09: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour09 = clock.select('#hour09');
            var line09 = clock.select('#line09');
            var circle09 = clock.select('#circle09');

            this.removeOtherActives('hour09', 'line09', 'circle09');
            line09.appendTo(clock);
            circle09.appendTo(clock);
            hour09.addClass('interiorWhite');
            hour09.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour09', 'line09', 'circle09');
        },

        click10: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour10 = clock.select('#hour10');
            var line10 = clock.select('#line10');
            var circle10 = clock.select('#circle10');

            this.removeOtherActives('hour10', 'line10', 'circle10');
            line10.appendTo(clock);
            circle10.appendTo(clock);
            hour10.addClass('interiorWhite');
            hour10.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour10', 'line10', 'circle10');
        },

        click11: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour11 = clock.select('#hour11');
            var line11 = clock.select('#line11');
            var circle11 = clock.select('#circle11');

            this.removeOtherActives('hour11', 'line11', 'circle11');
            line11.appendTo(clock);
            circle11.appendTo(clock);
            hour11.addClass('interiorWhite');
            hour11.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour11', 'line11', 'circle11');
        },

        click12: function()
        {
            var clock = Snap('#clocks-hour-svg');
            var hour12 = clock.select('#hour12');
            var line12 = clock.select('#line12');
            var circle12 = clock.select('#circle12');

            this.removeOtherActives('hour12', 'line12', 'circle12');
            line12.appendTo(clock);
            circle12.appendTo(clock);
            hour12.addClass('interiorWhite');
            hour12.animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.drag('hour12', 'line12', 'circle12');
        },

        amClicked: function()
        {

        },

        pmClicked: function()
        {

        }
    }
});
