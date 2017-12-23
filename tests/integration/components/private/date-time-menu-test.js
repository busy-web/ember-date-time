import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import _state from '@busy-web/ember-date-time/utils/state';
import moment from 'moment';

moduleForComponent('private/date-time-menu', 'Integration | Component | private/date time menu', {
  integration: true
});

const timestamp = moment().valueOf();
const stateManager = _state({
	timestamp: timestamp,
	section: '',
	isOpen: false,
	isTop: false,
});

test('it renders', function(assert) {
	this.set('stateManager', stateManager);

	this.render(hbs`{{private/date-time-menu stateManager=stateManager}}`);

	assert.ok(this.$().text().trim().length === 0);
});
