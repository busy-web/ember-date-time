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

    time: 1469080697, //may 5 2016, 5 am

    lastGroup: null,
    lastMinute: null,

    hours: 10,
    minutes: 53,

    isAM: true,
    isPM: false,

    didInsertElement: function()
    {
        this._super();
        this.changesClock();
    },

    /**
     * observes when the hours value is changed, and sets the clock to the new hour
     * function for HOURS
     * @public
     */
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

    /**
     * sets the new hour to active, as well as making every other hour not active
     * function for HOURS
     * @public
     */
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

    /**
     * handles all the function events for dragging on the hours clock
     * newDrag must contain start, move and stop functions within it
     * function for HOURS
     * @public
     */
    newDrag: function(hour, line, circle)
    {
        var _this = this;
        var clock = new Snap('#clocks-hour-svg');
        var curHour = clock.select('#' + hour);

        /**
         * allows for the hours group to start being dragged
         */
        var start = function() {
            this.data('origTransform', this.transform().local );
            curHour.remove();
            curHour.appendTo(clock);
            curHour.removeClass('interiorWhite');
        };

        /**
         * moves the dial on the hour clock while transforming group
         */
        var move = function(dx,dy,x,y) {

            var endX = x - 133;
            var endY = -(y - 210);
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

        /**
         * checks to see where the dragging stops and makes the closest hour active
         */
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

    /**
     * observes when the minutes value is changed, and sets the clock to the new hour
     * function for MINUTES
     * @public
     */
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

    /**
     * sets the new minute to active, as well as making every other minute not active
     * function for MINUTES
     * @public
     */
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
        this.minutesDrag(minute, line, circle);
        this.set('minutes', newTime);
    },

    /**
     * handles all the function events for dragging on the minutes clock
     * minutesDrag must contain start, move and stop functions within it
     * function for HOURS
     * @public
     */
    minutesDrag: function(minute, line, circle)
    {
        var clock = new Snap('#clock-minutes-svg');
        var _this = this;
        var newMin = parseInt(minute.slice(-2));
        var curMinute = clock.select('#minText' + newMin);

        /**
         * allows for the minutes group to start being dragged
         */
        var start = function() {
            this.data('origTransform', this.transform().local );
            if(newMin % 5 === 0)
            {
                curMinute.remove();
                curMinute.appendTo(clock);
                curMinute.removeClass('interiorWhite');
            }
        };

        /**
         * moves the dial on the minute clock while transforming group
         */
        var move = function(dx,dy,x,y) {
            var endX = x - 381;
            var endY = -(y - 213);
            var startX = endX - dx;
            var startY = endY + dy;

            var slope = (startY/startX);
            var isForward = endY < (slope*endX);

            var angle = _this.angle(endX, endY, startX, startY);

            var last2 = parseInt(minute.slice(-2));
            if (last2 <= 30 || last2 === 0)
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

        /**
         * checks to see where the dragging stops and makes the closest hour active
         */
        var stop = function() {
            //need to do
        };

        if (!Ember.isNone(this.get('lastMinute')))
        {
            var undragPrevious = this.get('lastMinute');
            undragPrevious.undrag();
        }

        if (newMin % 5 === 0)
        {
            var newMin2 = ('0' + minute).slice(-2);
            var curMin = clock.select('#minText' + newMin2);
            var curLine = clock.select('#' + line);
            var curCircle = clock.select('#' + circle);
            var currentSelect = clock.g(curLine, curCircle, curMin);

            currentSelect.drag(move, start, stop);
            this.set('lastMinute', currentSelect);
        }
        else
        {
            var curLine2 = clock.select('#' + line);
            var curCircle2 = clock.select('#' + circle);
            var currentSelect2 = clock.g(curLine2, curCircle2);

            currentSelect2.drag(move, start, stop);
            this.set('lastMinute', currentSelect2);
        }
    },

    /**
     * initially sets the clocks based on the passed time
     *
     * @public
     */
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

    /**
     * gets the angle at which the drag is taking place
     *
     * @public
     */
    angle: function(x, y, x2, y2)
    {
        let p0 = Math.sqrt(Math.pow(0-x, 2)+Math.pow(0-y, 2));
        let p1 = Math.sqrt(Math.pow(0-x2, 2)+Math.pow(0-y2, 2));
        let p2 = Math.sqrt(Math.pow(x2-x, 2)+Math.pow(y2-y, 2));

        return (Math.acos(((p1*p1)+(p0*p0)-(p2*p2))/(2*(p1*p0)))*360)/(2*Math.PI);
    },

    actions: {

        /**
         * sets the clicked hour to active and makes the active hour draggable
         *
         * @public
         */
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

        /**
         * sets the clicked minute to active and makes the active minute draggable
         *
         * @public
         */
        clickMin: function(minute, line, circle)
        {
            var clock = new Snap('#clock-minutes-svg');

            this.removeMinuteActives(minute, line, circle);
            clock.select('#' + line).appendTo(clock);
            clock.select('#' + circle).appendTo(clock);
            clock.select('#' + minute).addClass('interiorWhite');
            clock.select('#' + minute).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.minutesDrag(minute, line, circle);
        },

        /**
         * handles clicking on minutes that are not intervals of 5
         *
         * @public
         */
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

        /**
         * handles up or down buttons pressed when on hours
         *
         * @public
         */
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

        /**
         * handles up or down buttons pressed when on minutes
         *
         * @public
         */
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
