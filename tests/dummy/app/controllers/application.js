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

		this.set('unix', moment().add(moment().utcOffset(), 'minutes').unix());
		this.set('minDateUnix', moment().add(moment().utcOffset(), 'minutes').subtract(90, 'days').unix());
		this.set('maxDateUnix', moment().add(moment().utcOffset(), 'minutes').add(30, 'days').unix());

		this.set('milli', moment().valueOf());
		this.set('minDateMilli', moment().subtract(90, 'days').valueOf());
		this.set('maxDateMilli', moment().add(30, 'days').valueOf());
	},

	test: Ember.observer('unix', function() {
		window.console.log('unix changed', this.get('unix'));
	}),
});
