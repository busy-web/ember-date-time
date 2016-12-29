import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import moment from 'moment';

moduleForComponent('interfaces/combined-picker', 'Integration | Component | combined picker', {
  integration: true
});

const timestamp = moment().valueOf();

const paper = paperDate({
	timestamp: timestamp,
});

const calendar = paperDate({
	timestamp: timestamp,
});

const activeState = Ember.Object.create({
	state: '',
	isOpen: false,
	isTop: false,
});

test('it renders', function(assert) {
	this.set('paper', paper);
	this.set('calendar', calendar);
	this.set('activeState', activeState);

	this.render(hbs`{{interfaces/combined-picker paperDate=paper paperCalendar=calendar activeState=activeState}}`);

	assert.ok(this.$().text().trim().length === 0);
});

// test('toggle from clock to calendar and back', function(assert) {
//
//     this.set('timestamp', moment().unix() * 1000);
//     console.log(moment(this.get('timestamp')));
//     let time = moment(this.get('timestamp')).format('hh:mm A');
//     let date = moment(this.get('timestamp')).format('MMM DD, YYYY');
//
//     this.render(hbs`{{interfaces/combined-picker timestamp=timestamp isMilliseconds=true instanceNumber="one"}}`);
//
//     this.$('.current-date').click();
//     assert.equal(this.$('.current-date').text(), time);
//
//     this.$('.current-date').click();
//     assert.equal(this.$('.current-date').text(), date);
// });
