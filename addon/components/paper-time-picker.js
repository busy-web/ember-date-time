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

    time: 1469080697, //may 5 2016, 5 am

    lastGroup: null,

    didInsertElement: function()
    {
        this._super();
        this.changesClock();
    },

    newDrag: function(hour, line, circle)
    {
        var clock = Snap('#clocks-hour-svg');
        var _this = this;

        var curHour = clock.select('#' + hour);

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
            curHour.remove();
            curHour.appendTo(clock);
            curHour.removeClass('interiorWhite');
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
                if (degrees >= 0 && degrees <= 16)
                {
                    _this.removeOtherActives('hour12', 'line12', 'circle12');
                }
                if (degrees >= 16 && degrees <= 46)
                {
                    _this.removeOtherActives('hour01', 'line01', 'circle01');
                }
                if (degrees >= 46 && degrees <= 76)
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
                if (degrees >= 0 && degrees <= 16)
                {
                    _this.removeOtherActives('hour06', 'line06', 'circle06');
                }
                if (degrees >= 16 && degrees <= 46)
                {
                    _this.removeOtherActives('hour05', 'line05', 'circle05');
                }
                if (degrees >= 46 && degrees <= 76)
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
                if (degrees >= 0 && degrees <= 16)
                {
                    _this.removeOtherActives('hour06', 'line06', 'circle06');
                }
                if (degrees >= 16 && degrees <= 46)
                {
                    _this.removeOtherActives('hour07', 'line07', 'circle07');
                }
                if (degrees >= 46 && degrees <= 76)
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
                if (degrees >= 0 && degrees <= 16)
                {
                    _this.removeOtherActives('hour12', 'line12', 'circle12');
                }
                if (degrees >= 16 && degrees <= 46)
                {
                    _this.removeOtherActives('hour11', 'line11', 'circle11');
                }
                if (degrees >= 46 && degrees <= 76)
                {
                    _this.removeOtherActives('hour10', 'line10', 'circle10');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeOtherActives('hour09', 'line09', 'circle09');
                }
            }
        };
        if (!Ember.isNone(this.get('lastGroup')))
        {
            var undragPrevious = this.get('lastGroup');
            undragPrevious.undrag();
        }

        var curHour = clock.select('#' + hour);
        var curLine = clock.select('#' + line);
        var curCircle = clock.select('#' + circle);

        var curGroup = clock.g(curLine, curCircle, curHour);
        curGroup.drag(move, start, stop);
        this.set('lastGroup', curGroup);
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
        this.newDrag(activeHour, activeLine, activeCircle);
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

            this.removeOtherActives(hour, line, circle);
            this.newDrag(hour, line, circle);

        }
        else {
            var date = new Date();
        }
    },

    actions: {

        clickHour: function(hour, line, circle)
        {
            console.log(hour, line, circle);
            var clock = Snap('#clocks-hour-svg');

            this.removeOtherActives(hour, line, circle);
            clock.select('#' + line).appendTo(clock);
            clock.select('#' + circle).appendTo(clock);
            clock.select('#' + hour).addClass('interiorWhite');
            clock.select('#' + hour).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.newDrag(hour, line, circle);
        },

        amClicked: function()
        {

        },

        pmClicked: function()
        {

        }
    }
});
