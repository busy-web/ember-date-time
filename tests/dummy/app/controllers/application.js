import Ember from 'ember';
import moment from 'moment';

export default Ember.Controller.extend({

	unix: null,
	milli: null,

	minDateUnix: null,
	maxDateUnix: null,
	minDateMilli: null,
	maxDateMilli: null,

	init() {
		this._super();

		const totalPickers = 7;

		const model = {};
		const offset = moment().utcOffset();
		const minDate = 90;
		const maxDate = 45;
		for (var i=0; i<=totalPickers; i++) {
			const data = {
				standard: {
					timestamp: moment().valueOf(),
					minDate: moment().subtract(minDate, 'days').valueOf(),
					maxDate: moment().add(maxDate, 'days').valueOf()
				},
				seconds: {
					timestamp: moment().unix(),
					minDate: moment().subtract(minDate, 'days').unix(),
					maxDate: moment().add(maxDate, 'days').unix()
				},
				standardUTC: {
					timestamp: moment().add(offset, 'minutes').valueOf(),
					minDate: moment().add(offset, 'minutes').subtract(minDate, 'days').valueOf(),
					maxDate: moment().add(offset, 'minutes').add(maxDate, 'days').valueOf()
				},
				secondsUTC: {
					timestamp: moment().add(offset, 'minutes').unix(),
					minDate: moment().add(offset, 'minutes').subtract(minDate, 'days').unix(),
					maxDate: moment().add(offset, 'minutes').add(maxDate, 'days').unix()
				}
			};

			model[`picker${i}`] = data;
		}

		this.set('model', model);
	},

	test: Ember.observer('unix', function() {
		window.console.log('unix changed', this.get('unix'));
	}),
});
