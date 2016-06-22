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

    timestamp: null,

    maxDate: null,
    minDate: null,

    lastGroup: null,
    lastMinute: null,

    lastHourText: null,
    lastHourLine: null,
    lastHourCircle: null,

    lastMinuteText: null,
    lastMinuteLine: null,
    lastMinuteCircle: null,

    hours: null,
    minutes: null,

    hoursActive: true,
    minutesActive: false,

    currentDate: null,

    didInsertElement: function()
    {
        this._super();
        this.changesClock();

        if(moment(this.get('timestamp')).format('A') === "AM")
        {
            Ember.$('.am').addClass('am-active');
            Ember.$('.pm').addClass('pm-inactive');
        }
        else
        {
            Ember.$('.pm').addClass('pm-active');
            Ember.$('.am').addClass('am-inactive');
        }
    },

    clickableDate: Ember.observer('timestamp', function()
    {
        var timestamp = this.get('timestamp');
        var momentObj = moment(timestamp);
        var format = momentObj.format('MMM DD, YYYY');

        this.set('currentDate', format);
    }),

    observesHours: Ember.observer('timestamp', function()
    {
        var timestamp = this.get('timestamp');
        var momentObj = moment(timestamp);

        var hour = momentObj.hour();
        var currentMeridian = momentObj.format('A');

        if (currentMeridian === 'AM')
        {
            if (hour === 0)
            {
                this.set('hours', '12');
            }
            else
            {
                var newTime2 = momentObj.hour();
                this.set('hours', ('0' + newTime2).slice(-2));
            }
        }
        else
        {
            if (hour === 12)
            {
                this.set('hours', '12');
            }
            else
            {
                var newTime4 = momentObj.hour();
                this.set('hours', ('0' + (newTime4 - 12)).slice(-2));
            }
        }
    }),

    observesMinutes: Ember.observer('timestamp', function()
    {
        var time = this.get('timestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('mm');

        this.set('minutes', newFormat);
    }),

    observesAmPm: Ember.observer('timestamp', function()
    {
        var time = this.get('timestamp');
        var momentObj = moment(time);
        var newFormat = momentObj.format('A');

        if(newFormat === "AM")
        {
            Ember.$('.am').removeClass('am-inactive');
            Ember.$('.am').addClass('am-active');

            Ember.$('.pm').removeClass('pm-active');
            Ember.$('.pm').addClass('pm-inactive');
        }
        else
        {
            Ember.$('.pm').removeClass('pm-inactive');
            Ember.$('.pm').addClass('pm-active');

            Ember.$('.am').addClass('am-inactive');
            Ember.$('.am').removeClass('am-active');
        }
    }),

    /**
     * remove initial circles and lines for hours clock
     * function for HOURS
     * @public
     */


    removeInitialHours: function()
    {
        if (this.get('hoursActive'))
        {
            var clock = new Snap('#clocks-hour-svg');
            var bigCircle = clock.select('#bigCircle');
            var allHours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];

            allHours.forEach(function(item)
            {
                var hourSelect = '#hour' + item;
                var lineSelect = '#line' + item;
                var circleSelect = '#circle' + item;

                clock.select(hourSelect).removeClass('interiorWhite');
                clock.select(lineSelect).insertBefore(bigCircle);
                clock.select(circleSelect).insertBefore(bigCircle);
            });
        }
    },

    /**
     * remove initial circles and lines for hours clock
     * function for HOURS
     * @public
     */
    removeInitialMinutes: function()
    {
        if (this.get('minutesActive'))
        {
            var clock = new Snap('#clock-minutes-svg');
            var bigCircle = clock.select('#bigCircleMinutes');
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
        }
    },

    /**
     * removes the last active hour and displays the now active one
     * function for HOURS
     * @public
     */
    removeLastActiveHour: function(activeHour, activeLine, activeCircle)
    {
        if (this.get('hoursActive'))
        {
            var clock = new Snap('#clocks-hour-svg');
            var bigCircle = clock.select('#bigCircle');

            var hourText = this.get('lastHourText');
            var hourLine = this.get('lastHourLine');
            var hourCircle = this.get('lastHourCircle');

            if (!Ember.isNone(hourText) || !Ember.isNone(hourLine) || !Ember.isNone(hourCircle))
            {
                clock.select('#' + hourText).removeClass('interiorWhite');
                clock.select('#' + hourLine).insertBefore(bigCircle);
                clock.select('#' + hourCircle).insertBefore(bigCircle);
            }

            clock.select('#' + activeHour).addClass('interiorWhite');
            clock.select('#' + activeLine).appendTo(clock);
            clock.select('#' + activeCircle).appendTo(clock);
            clock.select('#' + activeHour).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.set('lastHourText', activeHour);
            this.set('lastHourLine', activeLine);
            this.set('lastHourCircle', activeCircle);

            this.newDrag(activeHour, activeLine, activeCircle);
        }
    },

    /**
     * sets the new minute to active, as well as making the last minute not active
     * function for MINUTES
     * @public
     */
    removeLastActiveMinute: function(minute, line, circle)
    {
        if (this.get('minutesActive'))
        {
            var clock = new Snap('#clock-minutes-svg');
            var bigCircle = clock.select('#bigCircleMinutes');
            var newTime = ('0' + minute).slice(-2);

            var minuteText = this.get('lastMinuteText');
            var minuteLine = this.get('lastMinuteLine');
            var minuteCircle = this.get('lastMinuteCircle');

            if (!Ember.isNone(minuteText) || !Ember.isNone(minuteLine) || !Ember.isNone(minuteCircle))
            {
                var sliceOld = parseInt(('0' + minuteText).slice(-2));
                if (sliceOld % 5 === 0)
                {
                    clock.select('#' + minuteText).removeClass('interiorWhite');
                }
                clock.select('#' + minuteLine).insertBefore(bigCircle);
                clock.select('#' + minuteCircle).insertBefore(bigCircle);
            }

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

            this.set('lastMinuteText', minute);
            this.set('lastMinuteLine', line);
            this.set('lastMinuteCircle', circle);

            this.minutesDrag(minute, line, circle);
        }
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
                    _this.removeLastActiveHour('hour00', 'line00', 'circle00');
                }
                if (degrees >= 16 && degrees <= 46)
                {
                    _this.removeLastActiveHour('hour01', 'line01', 'circle01');
                }
                if (degrees >= 46 && degrees <= 76)
                {
                    _this.removeLastActiveHour('hour02', 'line02', 'circle02');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeLastActiveHour('hour03', 'line03', 'circle03');
                }
            }

            if(dxPos === 'right' && dyPos === 'bottom')
            {
                if (degrees >= 0 && degrees <= 16)
                {
                    _this.removeLastActiveHour('hour06', 'line06', 'circle06');
                }
                if (degrees >= 16 && degrees <= 46)
                {
                    _this.removeLastActiveHour('hour05', 'line05', 'circle05');
                }
                if (degrees >= 46 && degrees <= 76)
                {
                    _this.removeLastActiveHour('hour04', 'line04', 'circle04');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeLastActiveHour('hour03', 'line03', 'circle03');
                }
            }

            if(dxPos === 'left' && dyPos === 'bottom')
            {
                if (degrees >= 0 && degrees <= 16)
                {
                    _this.removeLastActiveHour('hour06', 'line06', 'circle06');
                }
                if (degrees >= 16 && degrees <= 46)
                {
                    _this.removeLastActiveHour('hour07', 'line07', 'circle07');
                }
                if (degrees >= 46 && degrees <= 76)
                {
                    _this.removeLastActiveHour('hour08', 'line08', 'circle08');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeLastActiveHour('hour09', 'line09', 'circle09');
                }
            }

            if(dxPos === 'left' && dyPos === 'top')
            {
                if (degrees >= 0 && degrees <= 16)
                {
                    _this.removeLastActiveHour('hour00', 'line00', 'circle00');
                }
                if (degrees >= 16 && degrees <= 46)
                {
                    _this.removeLastActiveHour('hour11', 'line11', 'circle11');
                }
                if (degrees >= 46 && degrees <= 76)
                {
                    _this.removeLastActiveHour('hour10', 'line10', 'circle10');
                }
                if (degrees >= 76 && degrees <= 90)
                {
                    _this.removeLastActiveHour('hour09', 'line09', 'circle09');
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

        var currentHour = moment(this.get('timestamp')).hour();
        var currentClock = parseInt(hour.slice(-2));

        if (currentHour !== currentClock)
        {
            var timestamp = this.get('timestamp');
            var momentObj = moment(timestamp);

            if (momentObj.format('A') === "AM")
            {
                var setHour = momentObj.hour(currentClock);
                var reverseConversion = setHour.unix() * 1000;
                this.set('timestamp', reverseConversion);
            }
            else
            {
                var setHour2 = momentObj.hour(currentClock + 12);
                var reverseConversion2 = setHour2.unix() * 1000;
                this.set('timestamp', reverseConversion2);
            }
        }
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
        this.removeInitialHours();
        this.removeInitialMinutes();

        if(!Ember.isNone(this.get('timestamp')))
        {
            var time = this.get('timestamp');
            var momentObj = moment(time);

            var hours = momentObj.hour();
            var minutes = momentObj.minutes();
            var currentDate = momentObj.format('MMM DD, YYYY');

            var sliceMinute = ('0' + minutes%60).slice(-2);
            var activeHour = ('0' + (hours%12)).slice(-2);

            this.set('hours', activeHour);
            this.set('minutes', sliceMinute);
            this.set('currentDate', currentDate);

            var hour = 'hour' + activeHour;
            var line = 'line' + activeHour;
            var circle = 'circle' + activeHour;

            var minText = 'minText' + sliceMinute;
            var lineText = 'minLine' + sliceMinute;
            var circleText = 'minCircle' + sliceMinute;

            this.removeLastActiveMinute(minText, lineText, circleText);
            this.removeLastActiveHour(hour, line, circle);

        }
    },

    observeTimestamp: Ember.observer('timestamp', function()
    {
        if(!Ember.isNone(this.get('timestamp')))
        {
            var time = this.get('timestamp');
            var momentObj = moment(time);

            var hours = momentObj.hour();
            var minutes = momentObj.minutes();
            var sliceMinute = ('0' + minutes%60).slice(-2);
            var activeHour = ('0' + (hours%12)).slice(-2);

            var hour = 'hour' + activeHour;
            var line = 'line' + activeHour;
            var circle = 'circle' + activeHour;

            var minText = 'minText' + sliceMinute;
            var lineText = 'minLine' + sliceMinute;
            var circleText = 'minCircle' + sliceMinute;

            this.removeLastActiveMinute(minText, lineText, circleText);
            this.removeLastActiveHour(hour, line, circle);
        }
    }),

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

            var timestamp = this.get('timestamp');
            var momentObj = moment(timestamp);

            if (momentObj.format('A') === "AM")
            {
                var setHour = momentObj.hour(parseInt(hour.slice(-2)));
                var reverseConversion = setHour.unix() * 1000;
                this.set('timestamp', reverseConversion);
            }
            else
            {
                var setHour2 = momentObj.hour(parseInt(hour.slice(-2)) + 12);
                var reverseConversion2 = setHour2.unix() * 1000;
                this.set('timestamp', reverseConversion2);
            }

            this.removeLastActiveHour(hour, line, circle);
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

            var time = this.get('timestamp');
            var momentObj = moment(time);
            var newMin = minute.slice(-2);
            var newTime = momentObj.minutes(newMin);
            var reverseConversion = newTime.unix() * 1000;

            this.set('timestamp', reverseConversion);

            this.removeLastActiveMinute(minute, line, circle);
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

            var time = this.get('timestamp');
            var momentObj = moment(time);
            var newTime = momentObj.minutes(minute);
            var reverseConversion = newTime.unix() * 1000;

            this.set('timestamp', reverseConversion);

            if (parseInt(minute) % 5 === 0)
            {
                var min = 'minText' + minute;
                var line = 'minLine' + minute;
                var circle = 'minCircle' + minute;

                this.set('minutes', minute);
                this.removeLastActiveMinute(min, line, circle);
                clock.select('#' + line).appendTo(clock);
                clock.select('#' + circle).appendTo(clock);
                clock.select('#' + min).addClass('interiorWhite');
                clock.select('#' + min).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
            }
            else
            {
                var min2 = 'minText' + minute;
                var line2 = 'minLine' + minute;
                var circle2 = 'minCircle' + minute;

                this.removeLastActiveMinute(min2, line2, circle2);
            }
        },


        amClicked: function()
        {
            var time = this.get('timestamp');
            var momentObj = moment(time);
            var current = momentObj.format('A');
            if (current === 'PM')
            {
                var newTime = momentObj.subtract(12, 'hours');
                var reverseConversionBack = (newTime.unix() * 1000);

                this.set('timestamp', reverseConversionBack);
            }
        },

        pmClicked: function()
        {
            var time = this.get('timestamp');
            var momentObj = moment(time);
            var current = momentObj.format('A');
            if (current === 'AM')
            {
                var newTime = momentObj.add(12, 'hours');
                var reverseConversionBack = (newTime.unix() * 1000);

                this.set('timestamp', reverseConversionBack);
            }
        },

        hourHeaderClicked: function()
        {
            Ember.$('#clocks-hour-svg').removeClass('inactive');
            Ember.$('#clocks-hour-svg').addClass('active');

            Ember.$('#clock-minutes-svg').removeClass('active');
            Ember.$('#clock-minutes-svg').addClass('inactive');

            Ember.$('.outside-hours-container-bottom').attr('style', 'pointer-events: none');
            Ember.$('.outside-hours-container').attr('style', 'pointer-events: all');

            Ember.$('.hours-header').removeClass('inactive');
            Ember.$('.hours-header').addClass('active');

            Ember.$('.minutes-header').removeClass('active');
            Ember.$('.minutes-header').addClass('inactive');

            this.set('hoursActive', true);
            this.set('minutesActive', false);
            this.removeInitialHours();

            var time = this.get('timestamp');
            var momentObj = moment(time);
            var hours = momentObj.hour();

            var activeHour = ('0' + (hours%12)).slice(-2);

            var hour = 'hour' + activeHour;
            var line = 'line' + activeHour;
            var circle = 'circle' + activeHour;

            this.removeLastActiveHour(hour, line, circle);
        },

        minuteHeaderClicked: function()
        {
            Ember.$('#clocks-hour-svg').removeClass('active');
            Ember.$('#clocks-hour-svg').addClass('inactive');

            Ember.$('#clock-minutes-svg').removeClass('inactive');
            Ember.$('#clock-minutes-svg').addClass('active');

            Ember.$('.outside-hours-container').attr('style', 'pointer-events: none');
            Ember.$('.outside-hours-container-bottom').attr('style', 'pointer-events: all');

            Ember.$('.hours-header').addClass('inactive');
            Ember.$('.hours-header').removeClass('active');

            Ember.$('.minutes-header').addClass('active');
            Ember.$('.minutes-header').removeClass('inactive');

            this.set('hoursActive', false);
            this.set('minutesActive', true);
            this.removeInitialMinutes();

            var time = this.get('timestamp');
            var momentObj = moment(time);

            var minutes = momentObj.minutes();

            var sliceMinute = ('0' + minutes%60).slice(-2);

            var minText = 'minText' + sliceMinute;
            var lineText = 'minLine' + sliceMinute;
            var circleText = 'minCircle' + sliceMinute;

            this.removeLastActiveMinute(minText, lineText, circleText);
        }

        // switchToCalender: function()
        // {
        //     console.log('need to do');
        // }
    }
});
