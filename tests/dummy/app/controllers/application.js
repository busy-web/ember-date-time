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

		this.set('unix', moment().unix());
		this.set('minDateUnix', moment().subtract(90, 'days').unix());
		this.set('maxDateUnix', moment().subtract(2, 'hours').add(1, 'days').unix());

		this.set('milli', moment().valueOf());
		this.set('minDateMilli', moment().subtract(90, 'days').valueOf());
		this.set('maxDateMilli', moment().add(30, 'days').valueOf());
	}
});
