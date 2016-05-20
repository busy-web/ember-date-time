import Ember from 'ember';
import layout from '../templates/components/paper-time-picker';
import Snap from 'snap-svg';
import mina from 'mina';
import moment from 'moment';

const center_x = 104.75;
const center_y = 105;

export default Ember.Component.extend(
{
    classNames: ['paper-time-picker'],

    layout: layout,

    rotateCircle: null,

    time: 1469080697, //may 5 2016, 5 am

    lastGroup: null,

    hours: 10,
    minutes: 53,

    isAM: true,
    isPM: false,

    didInsertElement: function()
    {
        this._super();
        this.changesClock();
    },

    observeHours: Ember.observer('hours', function()
    {
        var hour = this.get('hours');
        var sliceHour = ('0' + hour).slice(-2);

        var hourText = 'hour' + sliceHour;
        var lineText = 'line' + sliceHour;
        var circleText = 'circle' + sliceHour;
        if (sliceHour < 13 && sliceHour > 0)
        {
            this.removeOtherActives(hourText, lineText, circleText);
        }
        if (sliceHour > 12 && sliceHour < 25)
        {
            var simpleHour = sliceHour % 12;
            var sliceSimpleHour = ('0' + simpleHour).slice(-2);

            this.set('isPM', true);
            this.set('isAM', false);
            this.set('hours', sliceSimpleHour);

            hourText = 'hour' + sliceSimpleHour;
            lineText = 'line' + sliceSimpleHour;
            circleText = 'circle' + sliceSimpleHour;

            this.removeOtherActives(hourText, lineText, circleText);
        }
    }),

    observeMinutes: Ember.observer('minutes', function()
    {
        var minutes = this.get('minutes');
        var sliceMinute = ('0' + minutes).slice(-2);

        var minText = 'minText' + sliceMinute;
        var lineText = 'minLine' + sliceMinute;
        var circleText = 'minCircle' + sliceMinute;
        if (sliceMinute < 60 && sliceMinute > -1)
        {
            this.removeMinuteActives(minText, lineText, circleText);
        }
    }),


    newDrag: function(hour, line, circle)
    {
        var clock = new Snap('#clocks-hour-svg');
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

        var curHours = clock.select('#' + hour);
        var curLine = clock.select('#' + line);
        var curCircle = clock.select('#' + circle);

        var curGroup = clock.g(curLine, curCircle, curHours);
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
        var clock = new Snap('#clocks-hour-svg');
        var bigCircle = clock.select('#bigCircle');
        var allHours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

        allHours.forEach(function(item)
        {
            var hourSelect = '#hour' + item;
            var lineSelect = '#line' + item;
            var circleSelect = '#circle' + item;

            clock.select(hourSelect).removeClass('interiorWhite');
            clock.select(lineSelect).insertBefore(bigCircle);
            clock.select(circleSelect).insertBefore(bigCircle);
        });

        clock.select('#' + activeHour).addClass('interiorWhite');
        clock.select('#' + activeLine).appendTo(clock);
        clock.select('#' + activeCircle).appendTo(clock);
        clock.select('#' + activeHour).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        this.newDrag(activeHour, activeLine, activeCircle);

        var newTime = ('0' + activeHour).slice(-2);
        this.set('hours', newTime);
    },

    changesClock: function()
    {
        if(!Ember.isNone(this.get('time')))
        {
            var time = this.get('time');

            // Create a new JavaScript Date object based on the timestamp
            // multiplied by 1000 so that the argument is in milliseconds, not seconds.
            var date = new Date(time*1200);
            // Hours part from the timestamp
            var hours = date.getHours();
            // Minutes part from the timestamp
            var minutes = date.getMinutes();

            var activeHour = ('0' + (hours%12)).slice(-2);

            var hour = 'hour' + activeHour;
            var line = 'line' + activeHour;
            var circle = 'circle' + activeHour;

            this.set('hours', hours);
            this.set('minutes', minutes);
            this.removeOtherActives(hour, line, circle);
            this.newDrag(hour, line, circle);

        }
    },

    removeMinuteActives: function(minute, line, circle)
    {
        var clock = new Snap('#clock-minutes-svg');
        var bigCircle = clock.select('#bigCircleMinutes');
        var newTime = ('0' + minute).slice(-2);

        var allMinutes = [];

        for (var i = 0; i < 60; i++) {
            i = ('0' + i).slice(-2);
            allMinutes.push(i);
        }

        allMinutes.forEach(function(item)
        {
            var hourSelect = '#minText' + item;
            var lineSelect = '#minLine' + item;
            var circleSelect = '#minCircle' + item;

            if (!Ember.isNone(clock.select(hourSelect)))
            {
                clock.select(hourSelect).removeClass('interiorWhite');
            }
            clock.select(lineSelect).insertBefore(bigCircle);
            clock.select(circleSelect).insertBefore(bigCircle);
        });

        clock.select('#' + line).appendTo(clock);
        clock.select('#' + circle).appendTo(clock);
        if (newTime % 5 === 0)
        {
            clock.select('#' + minute).addClass('interiorWhite');
            clock.select('#' + minute).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        }
        else
        {
            var hoursToTop = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

            hoursToTop.forEach(function(item)
            {
                clock.select('#minText' + item).appendTo(clock);
            });

        }

        // this.newDrag(activeHour, activeLine, activeCircle);

        this.set('minutes', newTime);
    },

    actions: {

        clickHour: function(hour, line, circle)
        {
            var clock = new Snap('#clocks-hour-svg');

            this.removeOtherActives(hour, line, circle);
            clock.select('#' + line).appendTo(clock);
            clock.select('#' + circle).appendTo(clock);
            clock.select('#' + hour).addClass('interiorWhite');
            clock.select('#' + hour).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.newDrag(hour, line, circle);
        },

        clickMin: function(minute, line, circle)
        {
            var clock = new Snap('#clock-minutes-svg');

            this.removeMinuteActives(minute, line, circle);
            clock.select('#' + line).appendTo(clock);
            clock.select('#' + circle).appendTo(clock);
            clock.select('#' + minute).addClass('interiorWhite');
            clock.select('#' + minute).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
        },

        minuteSectionClicked: function(minute)
        {
            var clock = new Snap('#clock-minutes-svg');
            if (parseInt(minute) % 5 === 0)
            {
                var min = 'minText' + minute;
                var line = 'minLine' + minute;
                var circle = 'minCircle' + minute;

                this.set('minutes', minute);
                this.removeMinuteActives(min, line, circle);
                clock.select('#' + line).appendTo(clock);
                clock.select('#' + circle).appendTo(clock);
                clock.select('#' + min).addClass('interiorWhite');
                clock.select('#' + min).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
            }
            else
            {
                var line2 = 'minLine' + minute;
                var circle2 = 'minCircle' + minute;

                this.removeMinuteActives(minute, line2, circle2);
            }
        },

        upOrDownHour: function(value, event)
        {
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var hour = this.get('hours');
                var parseHour = parseInt(hour) + 1;
                var slice = ('0' + parseHour).slice(-2);
                this.set('hours', slice);
            }
            if (code === 40)
            {
                var hourDown = this.get('hours');
                var parseHourDown = parseInt(hourDown) - 1;
                var sliceDown = ('0' + parseHourDown).slice(-2);

                if (sliceDown > -1 && sliceDown <= 59)
                {
                    this.set('hours', sliceDown);
                }
                if (sliceDown < 0)
                {
                    this.set('hours', '11');
                }
                if (sliceDown === '00')
                {
                    this.set('hours', '12');
                }
            }
        },

        upOrDownMinute: function(value, event)
        {
            var code = event.keyCode || event.which;
            if (code === 38)
            {
                var minute = this.get('minutes');
                var parseMinute = parseInt(minute) + 1;
                var slice = ('0' + parseMinute).slice(-2);

                if (slice <= 59)
                {
                    this.set('minutes', slice);
                }
                if (slice > 59)
                {
                    this.set('minutes', '00');
                }
            }
            if (code === 40)
            {
                var minuteDown = this.get('minutes');
                var parseMinuteDown = parseInt(minuteDown) - 1;
                var sliceDown = ('0' + parseMinuteDown).slice(-2);

                if (sliceDown > -1 && sliceDown <= 59)
                {
                    this.set('minutes', sliceDown);
                }
                if (sliceDown < 0)
                {
                    this.set('minutes', '59');
                }
            }
        },

        amClicked: function()
        {

        },

        pmClicked: function()
        {

        }
    }
});
