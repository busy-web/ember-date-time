import { moduleForComponent, test } from 'ember-qunit';
import moment from 'moment';

moduleForComponent('paper-datetime-picker', 'Unit | Component | paper-datetime-picker', {
  needs: ['component:interfaces/combined-picker'],
  unit: true
});

test('it renders', function(assert) {

  const time = moment().unix() * 1000;
  const args = {'timestamp': time};

  this.subject(args);
  this.render();
  assert.ok(this.$().text().trim());
});
