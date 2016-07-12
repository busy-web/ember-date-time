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


        var minText = 'minText' + sliceMinute;
        var lineText = 'minLine' + sliceMinute;
        var circleText = 'minCircle' + sliceMinute;

        this.removeLastActiveMinute(minText, lineText, circleText);
        this.removeLastActiveHour(activeHour);

        if(this.timeIsAm())
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
        let timestamp = moment(this.get('timestamp'));
        let format = timestamp.format('MMM DD, YYYY');

        this.set('currentDate', format);
    }),

    observesHours: Ember.observer('timestamp', function()
    {
        let hour = this.currentHour();
        hour =  hour === '00' ? '12' : hour;
        this.set('hours', hour);
    }),

    observesMinutes: Ember.observer('timestamp', function()
    {
        let minute = this.currentMinute();
        this.set('minutes', minute);
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
        let _this = this;
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
                    let item = _this.formatHourStrings(hourAM);
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
                    let clockHour = _this.formatMinuteStrings((parseInt(hourPM) - 12));
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
        let _this = this;
        let clock = new Snap('#clock-minutes-svg');

        let maxDate = moment(this.get('maxDate'));
        let minDate = moment(this.get('minDate'));
        let timestamp = moment(this.get('timestamp'));

        if (!Ember.isNone(maxDate) || !Ember.isNone(minDate))
        {
            let allMinutes = [];

            for (var i = 0; i < 60; i++) {
                i = ('0' + i).slice(-2);
                allMinutes.push(i);
            }
            allMinutes.forEach(function(minute)
            {
                let item = _this.formatMinuteStrings(minute);

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
        let _this = this;

        if (this.get('hoursActive'))
        {
            let allHours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
            allHours.forEach(function(item)
            {
                _this.removeHour(item);
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
        let _this = this;
        if (this.get('minutesActive'))
        {
            let allMinutes = [];
            for (var i = 0; i < 60; i++) {
                i = ('0' + i).slice(-2);
                allMinutes.push(i);
            }

            allMinutes.forEach(function(item)
            {
                _this.removeMinute(item);
            });
        }
    },

    /**
     * removes the last active hour and displays the now active one
     * function for HOURS
     * @public
     */
    removeLastActiveHour: function(hour)
    {
        let strings = this.hourStrings(hour);
        if (this.get('hoursActive'))
        {
            if (!Ember.isNone(this.get('lastHourText')) || !Ember.isNone(this.get('lastHourLine')) || !Ember.isNone(this.get('lastHourCircle')))
            {
                let hour = this.formatHourStrings(this.get('lastHourText'));
                this.removeHour(hour);
            }

            this.hourTextActivate(strings.text, strings.line, strings.circle);

            this.set('lastHourText', strings.text);
            this.set('lastHourLine', strings.line);
            this.set('lastHourCircle', strings.circle);
            this.newDrag(hour);
        }
    },

    /**
     * sets the new minute to active, as well as making the last minute not active
     * function for MINUTES
     * @public
     */
    removeLastActiveMinute: function(minute)
    {
        let strings = this.minuteStrings(minute);
        if (this.get('minutesActive'))
        {
            if (!Ember.isNone(this.get('lastMinuteText')) || !Ember.isNone(this.get('lastMinuteLine')) || !Ember.isNone(this.get('lastMinuteCircle')))
            {
                let sliceOld = this.formatMinuteStrings(this.get('lastMinuteText'));
                this.removeMinute(sliceOld);
            }

            if (this.minuteModFive(this.formatMinuteStrings(minute)))
            {
                this.minuteTextActivate(this.formatMinuteStrings(minute));
            }
            else
            {
                console.log('here');
                this.minuteSectionActivate(this.formatMinuteStrings(minute));
            }

            this.set('lastMinuteText', strings.text);
            this.set('lastMinuteLine', strings.line);
            this.set('lastMinuteCircle', strings.circle);

            this.minutesDrag(strings.text, strings.line, strings.circle);
        }
    },

    /**
     * handles all the function events for dragging on the hours clock
     * newDrag must contain start, move and stop functions within it
     * function for HOURS
     * @public
     */
    newDrag: function(hour)
    {
        let _this = this;
        let clock = new Snap('#clocks-hour-svg');
        let strings = this.hourStrings(hour);

        var curHour = clock.select('#' + strings.text);
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

            let endX = x - (coordinates.left + 3);
            let endY = -(y - (coordinates.top - 3));
            let startX = endX - dx;
            let startY = endY + dy;

            let angle = _this.angle(endX, endY, startX, startY);

            let slope = (startY/startX);
            let isForward = endY < (slope*endX);

            let last2 = parseInt(_this.formatHourStrings(strings.text));

            if (last2 <= 6 || last2 === 12)
            {
                angle = isForward ? angle : -angle;
            }
            else
            {
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

        _this.postDragHours(strings.text);

        if (!Ember.isNone(this.get('lastGroup')))
        {
            var undragPrevious = this.get('lastGroup');
            undragPrevious.undrag();
        }

        var curHours = clock.select('#' + strings.text);
        var curLine = clock.select('#' + strings.line);
        var curCircle = clock.select('#' + strings.circle);
        var curGroup = clock.g(curLine, curCircle, curHours);

        curGroup.drag(move, start, stop);
        this.set('lastGroup', curGroup);
    },

    postDragHours(hour)
    {
        if (parseInt(this.currentHour()) !== this.formatHourInteger(hour))
        {
            let timestamp = moment(this.get('timestamp'));
            let setHour = null;

            if (this.timeIsAm())
            {
                setHour = timestamp.hour(this.formatHourInteger(hour));
                this.convertToTimestamp(setHour);
            }
            else
            {
                setHour = timestamp.hour(this.formatHourInteger(hour) + 12);
                this.convertToTimestamp(setHour);
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
        let time = moment(this.get('timestamp'));
        let hour = ('0' + (time.hour() % 12)).slice(-2);

        return hour;
    },

    currentMinute: function()
    {
        let time = moment(this.get('timestamp'));
        let minute = time.minute();

        return this.formatMinuteStrings(minute);
    },

    currentDateFormat: function()
    {
        let time = moment(this.get('timestamp'));

        return time.format('MMM DD, YYYY');
    },

    getHourByDegree: function(offset, degree)
    {
        let hour = (((offset / 30) + (Math.round(degree / 30))) % 12);
        let formatHour = this.formatHourStrings(hour);

        if (this.hourOverMaxMin(formatHour))
        {
            this.removeLastActiveHour(formatHour);
        }
        else
        {
            this.removeLastActiveHour(this.formatMinuteStrings(this.get('lastHourText')));
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

    removeHour: function(hour)
    {
        let clock = new Snap('#clocks-hour-svg');
        let bigCircle = clock.select('#bigCircle');

        clock.select('#hour' + hour).removeClass('interiorWhite');
        clock.select('#line' + hour).insertBefore(bigCircle);
        clock.select('#circle' + hour).insertBefore(bigCircle);
    },

    removeMinute: function(minute)
    {
        let clock = new Snap('#clock-minutes-svg');
        let bigCircle = clock.select('#bigCircleMinutes');

        if (!Ember.isNone(clock.select('#minText' + minute)))
        {
            clock.select('#minText' + minute).removeClass('interiorWhite');
        }

        clock.select('#minLine' + minute).insertBefore(bigCircle);
        clock.select('#minCircle' + minute).insertBefore(bigCircle);
    },

    hourTextActivate: function(hour, line, circle)
    {
        var clock = new Snap('#clocks-hour-svg');

        clock.select('#' + hour).addClass('interiorWhite');
        clock.select('#' + line).appendTo(clock);
        clock.select('#' + circle).appendTo(clock);
        clock.select('#' + hour).animate({fill: "white"}, 100, mina.easein).appendTo(clock);
    },

    minuteTextActivate: function(minute)
    {
        var clock = new Snap('#clock-minutes-svg');
        let strings = this.minuteStrings(minute);

        clock.select('#' + strings.line).appendTo(clock);
        clock.select('#' + strings.circle).appendTo(clock);
        clock.select('#' + strings.text).addClass('interiorWhite');
        clock.select('#' + strings.text).animate({fill: "white"}, 100, mina.easein).appendTo(clock);

        this.minutesDrag(strings.text, strings.line, strings.circle);
    },

    minuteSectionActivate: function(minute)
    {
        let strings = this.minuteStrings(minute);
        let clock = new Snap('#clock-minutes-svg');

        clock.select('#' + strings.line).appendTo(clock);
        clock.select('#' + strings.circle).appendTo(clock);
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

        if (this.minuteModFive(newMin))
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
            this.removeLastActiveHour(hour);
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
        clickHour: function(hour)
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

            this.removeLastActiveHour(hour);
        },

        /**
         * handles minute text being clicked
         *
         * @public
         */
        clickMin: function(minute)
        {
            this.setMinuteToTimestamp(this.formatMinuteInteger(minute));
            this.removeLastActiveMinute(minute);
        },

        /**
         * handles clicking on minutes that are not intervals of 5
         *
         * @public
         */
        minuteSectionClicked: function(minute)
        {
            this.setMinuteToTimestamp(this.formatMinuteInteger(minute));
            this.removeLastActiveMinute(this.formatMinuteStrings(minute));
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

            this.removeLastActiveHour(activeHour);
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
