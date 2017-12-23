import { moduleForComponent, test } from 'ember-qunit';
import _state from '@busy-web/ember-date-time/utils/state';
import moment from 'moment';

moduleForComponent('private/time-picker', 'Unit | Component | private/time picker', {
	unit: true
});

const timestamp = moment().valueOf();

test('it renders', function(assert) {
	const stateManager = _state({ timestamp });
	this.subject({ stateManager });
	this.render();
	assert.ok(this.$().text().trim());
});

test('set minute to timestamp', function(assert) {
	const stateManager = _state({ timestamp, section: 'minutes' });
	const component = this.subject({ stateManager });
	const minute = Math.floor(Math.random() * (59 - 0 + 1)) + 0;
	component.setTimestamp(minute);
	assert.equal(moment(component.get('timestamp')).minute(), minute);
});

test('save a date object', function(assert) {
	const stateManager = _state({ timestamp });
	const component = this.subject({ stateManager, section: 'hours' });
	const momentObject = moment().add('1', 'hour');
	component.saveTimestamp(momentObject);
	assert.equal(component.get('timestamp'), momentObject.valueOf());
});
