import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('paper-date-picker', 'Integration | Component | paper date picker', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.on('dayClicked', function(day) {console.log(day);});

  this.render(hbs`{{paper-date-picker}}`);

  assert.equal(this.$().text().trim(), '');

});
