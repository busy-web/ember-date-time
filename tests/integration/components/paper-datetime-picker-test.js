import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('paper-datetime-picker', 'Integration | Component | paper datetime picker', {
  integration: true
});

test('it renders', function(assert) {

  this.set('timestamp', moment().unix() * 1000);

  this.render(hbs`{{paper-datetime-picker timestamp=timestamp}}`);

  assert.ok(this.$().text().trim());

});
