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
        this.removeInitialHours();
        this.removeInitialMinutes();
        this.minMaxHourHandler();

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
        if(this.timeIsAm())
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

    minMaxHourHandler: Ember.observer('timestamp', function()
    {
        let clock = new Snap('#clocks-hour-svg');

        let maxDate = moment(this.get('maxDate'));
        let minDate = moment(this.get('minDate'));
        let timestamp = moment(this.get('timestamp'));

        if (!Ember.isNone(maxDate) || !Ember.isNone(minDate))
        {
            if (timestamp.format('A') === 'AM')
            {
                let amHours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
                amHours.forEach(function(hourAM)
                {
                    let item = ('0' + hourAM).slice(-2);
                    clock.select('#hour' + item).removeClass('disabled-hour');

                    let newHour = timestamp.hour(hourAM);
                    if (newHour.isBefore(minDate) || newHour.isAfter(maxDate))
                    {
                        clock.select('#hour' + item).addClass('disabled-hour');
                    }
                });
            }
            else
            {
                let pmHours = ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
                pmHours.forEach(function(hourPM)
                {
                    let clockHour = ('0' + parseInt(hourPM) % 12).slice(-2);
                    clock.select('#hour' + clockHour).removeClass('disabled-hour');

                    let newHour = timestamp.hour(hourPM);
                    if (newHour.isBefore(minDate) || newHour.isAfter(maxDate))
                    {
                        clock.select('#hour' + clockHour).addClass('disabled-hour');
                    }
                });
            }
        }
    }),

    minMaxMinuteHandler: Ember.observer('timestamp', function()
    {
        let clock = new Snap('#clock-minutes-svg');

        let maxDate = moment(this.get('maxDate'));
        let minDate = moment(this.get('minDate'));
        let timestamp = moment(this.get('timestamp'));

        if (!Ember.isNone(maxDate) || !Ember.isNone(minDate))
        {
            var allMinutes = [];

            for (var i = 0; i < 60; i++) {
                i = ('0' + i).slice(-2);
                allMinutes.push(i);
            }
            allMinutes.forEach(function(minute)
            {
                let item = ('0' + minute).slice(-2);

                clock.select('#sectionMin' + item).removeClass('disabled-minute');

                if (!Ember.isNone(clock.select('#minText' + item)))
                {
                    clock.select('#minText' + item).removeClass('disabled-minute');
                }

                let newMinute = timestamp.minute(minute);
                if (newMinute.isBefore(minDate) || newMinute.isAfter(maxDate))
                {
                    if (!Ember.isNone(clock.select('#minText' + item)))
                    {
                        clock.select('#minText' + item).addClass('disabled-minute');
                    }
                    clock.select('#sectionMin' + item).addClass('disabled-section');
                }
            });
        }
    }),

    /**
     * remove initial circles and lines for hours clock
     *
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
                clock.select('#hour' + item).removeClass('interiorWhite');
                clock.select('#line' + item).insertBefore(bigCircle);
                clock.select('#circle' + item).insertBefore(bigCircle);
            });
        }
    },

    /**
     * remove initial circles and lines for minutes clock
     *
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
                if (!Ember.isNone(clock.select('#minText' + item)))
                {
                    clock.select('#minText' + item).removeClass('interiorWhite');
                }
                clock.select('#minLine' + item).insertBefore(bigCircle);
                clock.select('#minCircle' + item).insertBefore(bigCircle);
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

            this.hourTextActivate(activeHour, activeLine, activeCircle);

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
        var currentAngle = null;
        var newHour = null;

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

            let center_point = Ember.$('#centerPointHour');
            let coordinates = center_point[0].getBoundingClientRect();

            var endX = x - (coordinates.left + 3);
            var endY = -(y - (coordinates.top - 3));
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

            let lastHour = _this.get('lastHourCircle');
            let actualHour = parseInt(lastHour.slice(-2));
            currentAngle = actualHour * 30;

            let anglePositive = angle > 0;
            let over180 = 180 + Math.abs((180 - Math.abs(angle)));

            newHour = anglePositive ? angle : over180;

        };

        /**
         * checks to see where the dragging stops and makes the closest hour active
         */
        var stop = function() {
            _this.getHourByDegree(currentAngle, newHour);
        };

        _this.postDragMinutes(hour);

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

    postDragMinutes(hour)
    {
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

    convertToTimestamp: function(momentObject)
    {
        let reverse = momentObject.unix() * 1000;
        this.set('timestamp', reverse);
    },

    currentHour: function()
    {
        var time = moment(this.get('timestamp'));
        var hour = ('0' + (time.hour() % 12)).slice(-2);

        return hour;
    },

    currentMinute: function()
    {
        var time = moment(this.get('timestamp'));
        var minute = time.minute();

        return this.formatMinuteStrings(minute);
    },

    currentDateFormat: function()
    {
        var time = moment(this.get('timestamp'));

        return time.format('MMM DD, YYYY');
    },

    getHourByDegree: function(offset, degree)
    {
        let hour = (((offset / 30) + (Math.round(degree / 30))) % 12);
        let formatHour = this.formatHourStrings(hour);

        if (this.hourOverMaxMin(formatHour))
        {
            this.removeLastActiveHour('hour' + formatHour, 'line' + formatHour, 'circle' + formatHour);
        }
        else
        {
            this.removeLastActiveHour(this.get('lastHourText'), this.get('lastHourLine'), this.get('lastHourCircle'));
        }
    },

    getMinuteByDegree: function(offset, degree)
    {
        let minute = (((offset / 6) + (Math.round(degree / 6))) % 60);
        let formatMinute = this.formatMinuteStrings(minute);

        if (this.minuteOverMaxMin(formatMinute))
        {
            if (this.minuteModFive(formatMinute))
            {
                this.setMinuteToTimestamp(minute);
                this.removeLastActiveMinute('minText' + formatMinute, 'minLine' + formatMinute, 'minCircle' + formatMinute);
            }
            else
            {
                this.minuteSectionActivate(formatMinute);
            }
        }
        else
        {
            if (this.minuteModFive(formatMinute))
            {
                this.setMinuteToTimestamp(minute);
                this.removeLastActiveMinute(this.get('lastMinuteText'), this.get('lastMinuteLine'), this.get('lastMinuteCircle'));
            }
            else
            {
                this.minuteSectionActivate(this.formatMinuteStrings(this.get('lastMinuteText')));
            }
        }
    },

    minuteModFive: function(minute)
    {
        if (parseInt(minute) % 5 === 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    minuteOverMaxMin: function(minute)
    {
        let time = moment(this.get('timestamp'));
        let setMin = time.minute(parseInt(minute));

        if (setMin.isBefore(this.get('minDate')) || setMin.isAfter(this.get('maxDate')))
        {
            return false;
        }
        else
        {
            return true;
        }
    },

    hourOverMaxMin: function(hour)
    {
        let timeAm = moment(this.get('timestamp'));
        let setAm = timeAm.hour(parseInt(hour));

        let timePm = moment(this.get('timestamp'));
        let setPm = timePm.hour(parseInt(hour) + 12);

        if (this.timeIsAm())
        {
            if (setAm.isBefore(this.get('minDate')) || setAm.isAfter(this.get('maxDate')))
            {
                return false;
            }
            else
            {
                return true;
            }
        }
        else
        {
            if (setPm.isBefore(this.get('minDate')) || setPm.isAfter(this.get('maxDate')))
            {
                return false;
            }
            else
            {
                return true;
            }
        }
    },

    timeIsAm: function()
    {
        let time = moment(this.get('timestamp'));
        if (time.format('A') === 'AM')
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    formatMinuteStrings: function(minute)
    {
        if (parseInt(minute) !== 60)
        {
            return ('0' + minute).slice(-2);
        }
        else
        {
            return '00';
        }
    },

    formatMinuteInteger: function(minute)
    {
        let min = minute.slice(-2);
        return parseInt(min);
    },

    formatHourStrings: function(hour)
    {
        if (parseInt(hour) !== 12)
        {
            return ('0' + hour).slice(-2);
        }
        else
        {
            return '00';
        }
    },

    formatHourInteger: function(hour)
    {
        let sliced = hour.slice(-2);
        return parseInt(sliced);
    },

    hourStrings: function(hour)
    {
        return {
            text: 'hour' + hour,
            line: 'line' + hour,
            circle: 'circle' + hour
        };
    },

    minuteStrings: function(minute)
    {
        return {
            text: 'minText' + minute,
            line: 'minLine' + minute,
            circle: 'minCircle' + minute
        };
    },

    setMinuteToTimestamp: function(minute)
    {
        var time = this.get('timestamp');
        var momentObj = moment(time);
        var newTime = momentObj.minutes(minute);
        var reverseConversion = newTime.unix() * 1000;

        this.set('timestamp', reverseConversion);
    },

    hourTextActivate: function(hour, line, circle)
    {
        var clock = new Snap('#clocks-hour-svg');

        clock.select('#' + hour).addClass('interiorWhite');
        clock.select('#' + line).appendTo(clock);
        clock.select('#' + circle).appendTo(clock);
        clock.select('#' + hour).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
    },

    minuteTextActivate: function(minute, line, circle)
    {
        var clock = new Snap('#clock-minutes-svg');

        this.removeLastActiveMinute(minute, line, circle);
        clock.select('#' + line).appendTo(clock);
        clock.select('#' + circle).appendTo(clock);
        clock.select('#' + minute).addClass('interiorWhite');
        clock.select('#' + minute).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

        this.minutesDrag(minute, line, circle);
    },

    minuteSectionActivate: function(minute)
    {
        this.setMinuteToTimestamp(minute);

        let strings = this.minuteStrings(minute);
        let clock = new Snap('#clock-minutes-svg');

        if (this.minuteModFive(minute))
        {
            this.set('minutes', minute);
            clock.select('#' + strings.line).appendTo(clock);
            clock.select('#' + strings.circle).appendTo(clock);
            clock.select('#' + strings.text).addClass('interiorWhite');
            clock.select('#' + strings.text).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

            this.removeLastActiveMinute(strings.text, strings.line, strings.circle);
        }
        else
        {
            this.removeLastActiveMinute(strings.text, strings.line, strings.circle);
        }
    },

    /**
     * handles all the function events for dragging on the minutes clock
     * minutesDrag must contain start, move and stop functions within it
     * function for Minutes
     * @public
     */
    minutesDrag: function(minute, line, circle)
    {
        var clock = new Snap('#clock-minutes-svg');
        var _this = this;
        var newMin = this.formatMinuteStrings(parseInt(minute.slice(-2)));
        var curMinute = clock.select('#minText' + newMin);

        var currentAngle = null;
        var newMinute = null;

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

            let center_point = Ember.$('#centerPointMinutes');
            let coordinates = center_point[0].getBoundingClientRect();

            var endX = x - (coordinates.left + 3);
            var endY = -(y - (coordinates.top - 3));

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

            let lastMinute = _this.get('lastMinuteCircle');
            let actualMinute = parseInt(lastMinute.slice(-2));
            currentAngle = actualMinute * 6;

            let anglePositive = angle > 0;
            let over180 = 180 + Math.abs((180 - Math.abs(angle)));

            newMinute = anglePositive ? angle : over180;

        };

        /**
         * checks to see where the dragging stops and makes the closest hour active
         */
        var stop = function() {
            _this.getMinuteByDegree(currentAngle, newMinute);
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
    setUpClock: Ember.on('init', Ember.observer('timestamp', function()
    {
        if(!Ember.isNone(this.get('timestamp')))
        {
            let currentHour = this.currentHour();
            let currentMinute = this.currentMinute();
            let currentDate = this.currentDateFormat();

            this.set('hours', currentHour);
            this.set('minutes', currentMinute);
            this.set('currentDate', currentDate);
        }
    })),

    /**
     * observes timestamp and keeps data correct
     *
     * @public
     */
    observeTimestamp: Ember.observer('timestamp', function()
    {
        if(!Ember.isNone(this.get('timestamp')))
        {
            let hour = this.currentHour();
            let minute = this.currentMinute();

            let hourObs = this.hourStrings(hour);
            let minuteObs = this.minuteStrings(minute);

            this.removeLastActiveMinute(minuteObs.text, minuteObs.line, minuteObs.circle);
            this.removeLastActiveHour(hourObs.text, hourObs.line, hourObs.circle);
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
            var timestamp = this.get('timestamp');
            var momentObj = moment(timestamp);

            if (this.timeIsAm())
            {
                var setHour = momentObj.hour(this.formatHourInteger(hour));
                this.convertToTimestamp(setHour);
            }
            else
            {
                var setHour2 = momentObj.hour(this.formatHourInteger(hour) + 12);
                this.convertToTimestamp(setHour2);
            }

            this.removeLastActiveHour(hour, line, circle);
            this.newDrag(hour, line, circle);
        },

        /**
         * handles minute text being clicked
         *
         * @public
         */
        clickMin: function(minute, line, circle)
        {
            this.setMinuteToTimestamp(this.formatMinuteInteger(minute));
            this.minuteTextActivate(minute, line, circle);
        },

        /**
         * handles clicking on minutes that are not intervals of 5
         *
         * @public
         */
        minuteSectionClicked: function(minute)
        {
            this.setMinuteToTimestamp(this.formatMinuteInteger(minute));
            this.minuteSectionActivate(this.formatMinuteStrings(minute));
        },

        /**
         * handles clicking AM, wont allow if it goes under min date
         *
         * @public
         */
        amClicked: function()
        {
            let time = moment(this.get('timestamp'));
            let newTime = time.subtract(12, 'hours');

            if (!this.timeIsAm())
            {
                if (!Ember.isNone(this.get('minDate')))
                {
                    if (!time.isBefore(this.get('minDate')))
                    {
                        this.convertToTimestamp(newTime);
                    }
                }
                else
                {
                    this.convertToTimestamp(newTime);
                }
            }
        },

        /**
         * handles clicking PM, wont allow if it goes over max date
         *
         * @public
         */
        pmClicked: function()
        {
            let time = moment(this.get('timestamp'));
            let newTime = time.add(12, 'hours');

            if (this.timeIsAm())
            {
                if (!Ember.isNone(this.get('maxDate')))
                {
                    if (!time.isAfter(this.get('maxDate')))
                    {
                        this.convertToTimestamp(newTime);
                    }
                }
                else
                {
                    this.convertToTimestamp(newTime);
                }
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
    }
});
