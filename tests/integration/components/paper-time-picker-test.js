import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('paper-time-picker', 'Integration | Component | paper time picker', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{complete-time-picker}}`);

  assert.equal(this.$('.hours-header').hasClass('active'), true);
  assert.equal(this.$('.minutes-header').hasClass('inactive'), true);

  this.$('.minutes-header').click();

  assert.equal(this.$('.hours-header').hasClass('inactive'), true);
  assert.equal(this.$('.minutes-header').hasClass('active'), true);

});
