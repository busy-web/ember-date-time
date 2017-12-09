import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import _state from '@busy-web/ember-date-time/utils/state';
import moment from 'moment';

moduleForComponent('private/date-time-menu', 'Integration | Component | private/date time menu', {
  integration: true
});

const timestamp = moment().valueOf();
const activeState = _state({
	timestamp: timestamp,
	section: '',
	isOpen: false,
	isTop: false,
});

test('it renders', function(assert) {
	this.set('activeState', activeState);

	this.render(hbs`{{private/date-time-menu activeState=activeState}}`);

	assert.ok(this.$().text().trim().length === 0);
});
