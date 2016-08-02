import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('paper-date-picker', 'Integration | Component | paper date picker', {
  integration: true
});

test('it renders', function(assert) {

  this.set('timestamp', moment());

  this.render(hbs`{{paper-date-picker timestamp=timestamp}}`);

  assert.ok(this.$().text().trim());
});
