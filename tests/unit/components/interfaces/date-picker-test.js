import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('interfaces/date-picker', 'Unit | Component | interfaces/date picker', {
  unit: true
});

test('it renders', function(assert) {

  // Creates the component instance
  /*let component =*/ this.subject();
  // Renders the component to the page
  this.render();
  assert.equal(this.$().text().trim(), '');
});
