import { moduleForComponent, test } from 'ember-qunit';
import paper from 'ember-paper-time-picker/utils/paper-date';
import moment from 'moment';

moduleForComponent('interfaces/time-picker', 'Unit | Component | interfaces/time picker', {
	needs: ['util:snap-utils', 'util:time-picker'],
	unit: true
});

const timestamp = moment().valueOf();

test('it renders', function(assert) {
	const paperDate = paper({timestamp: timestamp});

	this.subject({ paperDate });
	this.render();
	assert.ok(this.$().text().trim());
});

test('set minute to timestamp', function(assert) {
	const paperDate = paper({ timestamp: timestamp });
	const component = this.subject({ paperDate });
	const minute = Math.floor(Math.random() * (59 - 0 + 1)) + 0;

	component.setTimestamp('minutes', minute);

	assert.equal(moment(component.get('timestamp')).minute(), minute);
});

test('save a date object', function(assert) {
	const paperDate = paper({ timestamp: timestamp });
	const component = this.subject({ paperDate });
	const momentObject = moment().add('1', 'hour');

	component.saveTimestamp(momentObject);

	assert.equal(component.get('timestamp'), momentObject.valueOf());
});
