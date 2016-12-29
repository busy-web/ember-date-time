import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import paperDate from 'ember-paper-time-picker/utils/paper-date';
import TimePicker from 'ember-paper-time-picker/utils/time-picker';
import moment from 'moment';

moduleForComponent('interfaces/time-picker', 'Integration | Component | time picker', {
  integration: true
});

const timestamp = moment().valueOf();

const paper = paperDate({
	timestamp: timestamp,
});

const activeState = Ember.Object.create({
	state: '',
	isOpen: false,
	isTop: false,
});

test('it renders', function(assert) {
	this.set('paper', paper);
	this.set('activeState', activeState);

  this.render(hbs`{{interfaces/time-picker paperDate=paper activeState=activeState}}`);

  assert.ok(this.$().text().trim());
});

test('changes from hours to minutes', function(assert) {
	activeState.set('state', 'hour');
	this.set('paper', paper);
	this.set('activeState', activeState);

  this.render(hbs`{{interfaces/time-picker paperDate=paper activeState=activeState}}`);

  assert.ok(this.$('.paper-time-picker').hasClass('hours'), 'State is Hours');

	activeState.set('state', 'minute');

  assert.ok(this.$('.paper-time-picker').hasClass('minutes'), 'State is Minutes');
});

test('changes from pm to am and back', function(assert) {
	activeState.set('state', 'hour');
	this.set('paper', paper);
	this.set('activeState', activeState);

	let meridian = { start: moment(this.get('paper.timestamp')).format('A'), next: 'PM' };

	this.set('update', (flag, timestamp) => {
		const _meridian = moment(timestamp).format('A');
		meridian.next = _meridian;
	});

  this.render(hbs`{{interfaces/time-picker paperDate=paper activeState=activeState onUpdate=(action update)}}`);

	// if it is pm then swith to am to start tests
	if (meridian.start === 'PM') {
		this.$('.am-pm-container > .button.am').click();
		meridian.start = meridian.next;
	}

	// click the pm button
	this.$('.am-pm-container > .button.pm').click();

	assert.ok(meridian.start !== meridian.next, 'AM to PM switch');

	// set new start meridian
	meridian.start = meridian.next;
	// click the am button
	this.$('.am-pm-container > .button.am').click();

	assert.ok(meridian.start !== meridian.next, 'PM to AM switch');
});

test('test hour and minute headers', function(assert) {
	this.set('paper', paper);
	this.set('activeState', activeState);

  this.render(hbs`{{interfaces/time-picker paperDate=paper activeState=activeState}}`);

  let hour = moment(this.get('paper.timestamp')).hour();
  let minute = moment(this.get('paper.timestamp')).minute();

	hour = TimePicker.formatNumber(hour % 12);
  minute = ('0' + minute).slice(-2);

  assert.equal(this.$('.numbers-container > .hours').text().trim(), hour);
  assert.equal(this.$('.numbers-container > .minutes').text().trim(), minute);
});

test('click random minute sectionMin', function(assert) {
	activeState.set('state', 'minute');
	this.set('paper', paper);
	this.set('activeState', activeState);

  this.render(hbs`{{interfaces/time-picker paperDate=paper activeState=activeState}}`);

  let randomSection = ('0' + Math.round(Math.random() * (60 - 1) + 1)).slice(-2);
  let id = '#section-minutes-' + randomSection;

  this.$(id).click();

  assert.equal(this.$('.numbers-container > .minutes').text().trim(), randomSection);
});
