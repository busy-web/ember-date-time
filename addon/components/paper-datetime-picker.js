/**
 * @module Components
 *
 */
import Ember from 'ember';
import layout from '../templates/components/paper-datetime-picker';
import moment from 'moment';
import Time from 'busy-utils/time';
import Assert from 'busy-utils/assert';

/**
 * `Component/paper-datetime-picker`
 *
 * @class PaperDatetimePicker
 * @namespace Components
 * @extends Ember.Component
 */
export default Ember.Component.extend({
  /**
   * @private
   * @property classNames
   * @type String
   * @default paper-datetime-picker
   */
  classNames: ['paper-datetime-picker'],
  layout: layout,

  /**
   * timestamp that is passed in when using paper-datetime-picker
   *
   * @private
   * @property timestamp
   * @type Number
   */
  timestamp: null,

  /**
   * can be passed in so a date after the maxDate cannot be selected
   *
   * @private
   * @property maxDate
   * @type Number
   * @optional
   */
  maxDate: null,

  /**
   * can be passed in so a date before the minDate cannot be selected
   *
   * @private
   * @property minDate
   * @type Number
   * @optional
   */
  minDate: null,

  /**
   * can be passed in to give the input an initial class
   *
   * @private
   * @property class
   * @type String
   * @optional
   */
  class: null,

  /**
   * can be passed in as true or false, true sets timepicker to handle unix timestamp * 1000, false sets it to handle unix timestamp
   *
   * @private
   * @property isMilliseconds
   * @type boolean
   * @optional
   */
  isMilliseconds: false,

  /**
   * Merdian (AM/PM) that is shown in the input bar
   *
   * @private
   * @property timestampMeridian
   * @type String
   */
  timestampMeridian: null,

  /**
   * minutes that are shown in the input bar
   *
   * @private
   * @property timestampMinutes
   * @type String
   */
  timestampMinutes: null,

  /**
   * hours that are shown in the input bar
   *
   * @private
   * @property timestampHours
   * @type String
   */
  timestampHours: null,

  /**
   * days that are shown in the input bar
   *
   * @private
   * @property timestampDays
   * @type String
   */
  timestampDays: null,

  /**
   * months that are shown in the input bar
   *
   * @private
   * @property timestampMonths
   * @type String
   */
  timestampMonths: null,

  /**
   * years that are shown in the input bar
   *
   * @private
   * @property timestampYears
   * @type String
   */
  timestampYears: null,

  /**
   * bool for if the dialog is being shown or not
   *
   * @private
   * @property showDialogTop
   * @type bool
   */
  showDialogTop: false,

  /**
   * bool for if the dialog is being shown or not
   *
   * @private
   * @property showDialogBottom
   * @type bool
   */
  showDialogBottom: false,

  /**
   * string of the new active element on the picker
   *
   * @private
   * @property activeSection
   * @type string
   */
  activeSection: null,

  /**
   * value changes if the active section is changed to a different value or the SAME value
   *
   * @private
   * @property updateActive
   * @type Boolean
   */
  updateActive: true,

  /**
   * value shared with combined picker to destroy both dialogs when closed
   *
   * @private
   * @property destroyElements
   * @type Boolean
   */
  destroyElements: false,

  /**
   * value thats used to only allow one action to be sent each keyup/heydown for calender
   *
   * @private
   * @property keyHasGoneUp
   * @type Boolean
   */
  keyHasGoneUp: true,

  /**
   * checks if timestamp is valid calls updateInputValues
   *
   * @private
   * @method init
   * @constructor
   */
  init() {
    this._super(...arguments);

		// make sure isMilliseconds is set to a boolean value.
		Assert.isBoolean(this.get('isMilliseconds'));

		// changed to Assert.test in and removed if statements that are not needed.
		// minDate and maxDate should be null or a unix timestamp
    Assert.test("minDate must be a valid unix timestamp", Ember.isNone(this.get('minDate')) || (this.isValidTimestamp(this.get('minDate')) && this.isValidMomentObject(this.getMomentDate(this.get('minDate')))));
    Assert.test("maxDate must be a valid unix timestamp", Ember.isNone(this.get('maxDate')) || (this.isValidTimestamp(this.get('maxDate')) && this.isValidMomentObject(this.getMomentDate(this.get('maxDate')))));

		// timestamp must be set to a unix timestamp
    Assert.test("timestamp must be a valid unix timestamp", !Ember.isNone(this.get('timestamp')) && this.isValidTimestamp(this.get('timestamp')) && this.isValidMomentObject(this.getMomentDate(this.get('timestamp'))));

    this.updateInputValues();
  },

	/**
	 * Check if a timestamp is a valid date timestamp
	 *
	 * @public
	 * @method timestamp
	 * @param timestamp {number}
	 * @return {boolean} true if valid
	 */
	isValidTimestamp(timestamp) {
		return (typeof timestamp === 'number' && this.getMomentDate(timestamp).isValid());
	},

	/**
	 * Check to see if an object is a valid moment object
	 *
	 * @public
	 * @method isValidMomentObject
	 * @param date {object}
	 * @return {boolean} true if valid
	 */
	isValidMomentObject(date) {
		return (moment.isMoment(date) && date.isValid());
	},

	/**
	 * Get a monent object from a timestamp that could be seconds or milliseconds
	 *
	 * @public
	 * @method getMomentDate
	 * @param timestamp {number}
	 * @return {moment}
	 */
	getMomentDate(timestamp) {
		if (this.get('isMilliseconds')) {
			return moment(timestamp);
		} else {
			return moment(timestamp*1000);
		}
	},

  /**
   * observes the timestamp and updates the input values accordingly
   *
   * @private
   * @method updateInputValues
   */
  updateInputValues: Ember.observer('timestamp', function() {
		const time = this.getMomentDate(this.get('timestamp'));

    this.set('timestampMeridian', time.format('A'));
    this.set('timestampMinutes', time.format('mm'));
    this.set('timestampHours', time.format('hh'));
    this.set('timestampDays', time.format('DD'));
    this.set('timestampMonths', time.format('MM'));
    this.set('timestampYears', time.format('YYYY'));
  }),

  /**
   * observes the destroyElements value shared with combined picker and destroys both dialogs if set to true
   *
   * @private
   * @method updateInputValues
   */
  destroyOnChange: Ember.observer('destroyElements', function() {
    if (this.get('destroyElements')) {
      this.set('showDialogTop', false);
      this.set('showDialogBottom', false);
    }
  }),

  /**
   * receives a moment object and sets it to timestamp
   *
   * @private
   * @method setTimestamp
   * @param moment {object} moment object
   */
  setTimestamp(moment) {
    if (this.get('isMilliseconds')) {
      let reverse = Time.timestamp(moment);
      this.set('timestamp', reverse);
    } else {
      let reverse = moment.unix();
      this.set('timestamp', reverse);
    }
  },

  /**
   * only allows up and down arrows and tabs to be affected
   *
   * @private
   * @method onlyAllowArrows
   * @param {event} key press event
   */
  onlyAllowArrows(event) {
    const key = event.keyCode || event.which;
    if (key === 13) {
      this.set('showDialogTop', false);
      this.set('showDialogBottom', false);
    }

    if (key === 37 || key === 38 || key === 39 || key === 40 || key === 9) {
      return true;
    } else {
      event.returnValue = false;
      if(event.preventDefault) {
        event.preventDefault();
      }
    }
  },

  /**
   * removes display none from the dialog containers
   *
   * @private
   * @method addContainer
   */
  addContainer() {
    Ember.$('.bottom-dialog-container').removeClass('removeDisplay');
    Ember.$('.top-dialog-container').removeClass('removeDisplay');
  },

  /**
	 * TODO: I didnt like this function. mindate and maxdate are not always needed and this is
	 * doing extra work when they are used. There is a new function above that takes a timestamps and
	 * returns a monent date based on isMilliseconds. Also Time.date converts a timestamp to a moment date
	 * without converting to local time. We may need that but if that is the case both isMilliseconds and !isMilliseconds
	 * dates should be converted the same way. So for now I removed `Time.date` in the above function.
	 *
   * returns the correct moment objects, depending on if the timestamps are milliseconds or not
   *
   * @private
   * @method getCorrectMomentObjects
   * @return object
   */
  getCorrectMomentObjects() {
    let time, minDate, maxDate;
    if (this.get('isMilliseconds')) {
      time = moment(this.get('timestamp'));
      minDate = moment(this.get('minDate'));
      maxDate = moment(this.get('maxDate'));
    } else {
      time = Time.date(this.get('timestamp'));
      minDate = Time.date(this.get('minDate'));
      maxDate = Time.date(this.get('maxDate'));
    }

    return {time, minDate, maxDate};
  },

  actions: {

    /**
     * figures out if the dialog should go above or below the input and changes updateActive so combined-picker can make the correct changes
     *
     * @param active {string} string of which input field was selected
     * @event focusInput
     */
    focusInput(active) {
      let activeState = this.get('updateActive');
      let scrollTop = Ember.$(window).scrollTop();
      let elementOffsetTop = Ember.$('.paper-datetime-picker').offset().top;
      let distanceTop = (elementOffsetTop - scrollTop);
      let distanceBottom = Ember.$(document).height() - Ember.$('.paper-datetime-picker').offset().top - Ember.$('.paper-datetime-picker').height();

      if (distanceTop > distanceBottom) {
        this.set('showDialogBottom', false);
        this.set('showDialogTop', true);
        this.set('updateActive', !activeState);
      } else {
        this.set('showDialogTop', false);
        this.set('showDialogBottom', true);
        this.set('updateActive',  !activeState);
      }

      this.set('destroyElements', false);
      this.set('activeSection', active);
      this.addContainer();
    },

    /**
     * handles up and down arrows pressed while in the minutes input fields
     *
     * @event keyUpDownHours
     */
    keyUpDownMinutes() {
			// where are we getting event from ????
      const code = event.keyCode || event.which;

			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

			// TODO:
			// Im assuming onlyAllowArrows is going to stop the rest of the logic
			// from executing if it wasnt an arrow key pressed. If that is the case
			// then why do any logic before this. It may not be much but the extra logic
			// above does take some time. ????
			this.onlyAllowArrows(event);

			// Changed name from object to date
			// because it make more sense what we
			// are dealing with.
			let date;

			// TODO:
			//
			// COMMENT what is going on below. This is complex logic to try and
			// guess what is actually going on here...
			//
      if (code === 38 || code === 39) { // 38 and 39 mean what ???
        if (time.minutes() + 1 >= 60) { // assuming some up arrow logic here?
          date = time.subtract(59, 'minutes');

          if (!date.isBefore(minDate)) {
            this.setTimestamp(date);
          }
        } else {
          date = time.add(1, 'minutes');

          if (!date.isAfter(maxDate)) {
            this.setTimestamp(date);
          }
        }
					// Changed this to `else if` as I dont see there being more than one code at a time hitting this function.
      } else if (code === 37 || code === 40) { // 37 and 40 mean what ??? comments would be nice.
        if (time.minutes() - 1 < 0) { // assuming some down arrow logic here?
          date = time.add(59, 'minutes');

          if (!date.isAfter(maxDate)) {
            this.setTimestamp(date);
          }
        } else {
          date = time.subtract(1, 'minutes');

          if (!date.isBefore(minDate)) {
              this.setTimestamp(date);
          }
        }
      }
    },

    /**
     * handles up and down arrows pressed while in the hours input fields
     *
     * @event keyUpDownHours
     */
    keyUpDownHours() {
      const code = event.keyCode || event.which;
			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

      this.onlyAllowArrows(event);

      let date;

			// TODO:
			//
			// again comment this code is looks like the same code as above at first glance
			// Walk us through the logic here...
      if (code === 38 || code === 39) {
        if (((time.hour() + 1) % 12) === 0) {
          date = time.subtract(11, 'hours');

          if (!date.isBefore(minDate)) {
            this.setTimestamp(date);
          }
        } else {
          date = time.add(1, 'hours');

          if (!date.isAfter(maxDate)) {
            this.setTimestamp(date);
          }
        }
      }

      if (code ===37 || code === 40) {
        if ((time.hour() % 12) === 0) {
          date = time.add(11, 'hours');

          if (!date.isAfter(maxDate)) {
            this.setTimestamp(date);
          }
        } else {
          date = time.subtract(1, 'hours');

          if (!date.isBefore(date.minDate)) {
            this.setTimestamp(date);
          }
        }
      }
    },

    /**
     * handles up and down arrows pressed while in the days, months, or years input fields
     *
     * @param {string} 'days', 'years,', or 'months'
     * @event keyUpDownHandler
     */
    keyUpDownHandler(period) {
      const code = event.keyCode || event.which;
			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

      this.onlyAllowArrows(event);

			let date;
      if (this.get('keyHasGoneUp') === true) {
        if (code === 38 || code === 39) {
          date = time.add(1, period);

          if (!date.isAfter(maxDate)) {
            this.setTimestamp(date);
          }
        }

        if (code === 37 || code === 40) {
          date = time.subtract(1, period);

          if (!date.isBefore(minDate)) {
            this.setTimestamp(date);
          }
        }

        this.set('keyHasGoneUp', false);
      }
    },

    /**
     * allows keyup/keydown handlers to work for calender inputs
     *
     * @event resetKeyUp
     */
    resetKeyUp() {
      this.set('keyHasGoneUp', true);
    },

    /**
     * handles up and down arrows pressed while in the meridian input fields
     *
     * @event meridianKeyHandler
     */
    meridianKeyHandler() {
      const code = event.keyCode || event.which;
			const time = this.getMomentDate(this.get('timestamp'));
			const minDate = this.getMomentDate(this.get('minDate'));
			const maxDate = this.getMomentDate(this.get('maxDate'));

      this.onlyAllowArrows(event);

      let date;
      if (code ===37 || code === 38 || code === 39 || code === 40) {
        if (time.format('A') === 'AM') {
          date = time.add(12, 'hours');

          if (!date.isAfter(maxDate)) {
            this.setTimestamp(date);
          }
        } else {
          date = time.subtract(12, 'hours');

          if (!date.isBefore(minDate)) {
            this.setTimestamp(date);
          }
        }
      }
    }
  }
});
