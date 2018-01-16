import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import _state from '@busy-web/ember-date-time/utils/state';
import moment from 'moment';

moduleForComponent('private/time-picker', 'Integration | Component | private/time picker', {
  integration: true
});

const timestamp = moment().valueOf();
const stateManager = _state({
	timestamp: timestamp,
	state: '',
	isOpen: false,
	isTop: false
});

test('it renders', function(assert) {
	this.set('stateManager', stateManager);

  this.render(hbs`{{private/time-picker stateManager=stateManager}}`);

  assert.ok(this.$().text().trim());
});

test('changes from hours to minutes', function(assert) {
	stateManager.set('section', 'hours');
	this.set('stateManager', stateManager);
  this.render(hbs`{{private/time-picker stateManager=stateManager}}`);

  assert.ok(this.$('.clock-container').hasClass('hours'), 'State is Hours');

	this.set('stateManager.section', 'minutes');

  assert.ok(this.$('.clock-container').hasClass('minutes'), 'State is Minutes');
});

test('changes from pm to am and back', function(assert) {
	stateManager.set('section', 'hours');
	this.set('stateManager', stateManager);
	let meridian = { start: moment(this.get('paper.timestamp')).format('A'), next: 'PM' };

	this.set('update', (flag, timestamp) => {
		const _meridian = moment(timestamp).format('A');
		meridian.next = _meridian;
	});

  this.render(hbs`{{private/time-picker stateManager=stateManager onUpdate=(action update)}}`);

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

// test no longer working because trigger click does not
// send x, y, mouse coords. So the new click handle cannot determine
// the number to click on.
//
//test('click random minute sectionMin', function(assert) {
//	stateManager.set('format', 'MM/DD/YYYY hh:mm A');
//	stateManager.set('section', 'minutes');
//	this.set('stateManager', stateManager);
//
//  this.render(hbs`{{private/time-picker stateManager=stateManager}}`);
//
//  let randomSection = ('0' + Math.round(Math.random() * (59 - 1) + 1)).slice(-2);
//  let id = `.--svg-path-${randomSection}`;
//
//  this.$(id).trigger('click');
//
//  assert.equal(this.$('.numbers-container > .minutes').text().trim(), randomSection);
//});

