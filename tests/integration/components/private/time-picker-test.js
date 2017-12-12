import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import _state from '@busy-web/ember-date-time/utils/state';
import moment from 'moment';

moduleForComponent('private/time-picker', 'Integration | Component | private/time picker', {
  integration: true
});

const timestamp = moment().valueOf();
const activeState = _state({
	timestamp: timestamp,
	state: '',
	isOpen: false,
	isTop: false
});

test('it renders', function(assert) {
	this.set('activeState', activeState);

  this.render(hbs`{{private/time-picker activeState=activeState}}`);

  assert.ok(this.$().text().trim());
});

test('changes from hours to minutes', function(assert) {
	activeState.set('section', 'hours');
	this.set('activeState', activeState);
  this.render(hbs`{{private/time-picker activeState=activeState}}`);

  assert.ok(this.$('.p-time-picker').hasClass('hours'), 'State is Hours');

	this.set('activeState.section', 'minutes');

  assert.ok(this.$('.p-time-picker').hasClass('minutes'), 'State is Minutes');
});

test('changes from pm to am and back', function(assert) {
	activeState.set('section', 'hours');
	this.set('activeState', activeState);
	let meridian = { start: moment(this.get('paper.timestamp')).format('A'), next: 'PM' };

	this.set('update', (flag, timestamp) => {
		const _meridian = moment(timestamp).format('A');
		meridian.next = _meridian;
	});

  this.render(hbs`{{private/time-picker activeState=activeState onUpdate=(action update)}}`);

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

test('click random minute sectionMin', function(assert) {
	activeState.set('section', 'minutes');
	this.set('activeState', activeState);

  this.render(hbs`{{private/time-picker activeState=activeState}}`);

  let randomSection = ('0' + Math.round(Math.random() * (59 - 1) + 1)).slice(-2);
  let id = '#section-minutes-' + randomSection;

  this.$(id).click();

  assert.equal(this.$('.numbers-container > .minutes').text().trim(), randomSection);
});

