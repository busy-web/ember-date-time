import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('paper-time-picker-dialog-style', 'Integration | Component | paper time picker dialog style', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{paper-time-picker-dialog-style}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#paper-time-picker-dialog-style}}
      template block text
    {{/paper-time-picker-dialog-style}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
