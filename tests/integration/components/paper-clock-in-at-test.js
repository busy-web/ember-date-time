import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('paper-clock-in-at', 'Integration | Component | paper clock in at', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{paper-clock-in-at}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#paper-clock-in-at}}
      template block text
    {{/paper-clock-in-at}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
