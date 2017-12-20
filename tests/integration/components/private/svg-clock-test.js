import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('private/svg-clock', 'Integration | Component | private/svg clock', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{private/svg-clock}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#private/svg-clock}}
      template block text
    {{/private/svg-clock}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
