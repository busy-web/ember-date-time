import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('paper-time-picker', 'Integration | Component | paper time picker', {
  integration: true
});

test('it renders', function(assert) {

  this.set('timestamp', moment());

  this.render(hbs`{{paper-time-picker timestamp=timestamp}}`);

  assert.ok(this.$().text().trim());
});

test('changes from hours to minutes', function(assert) {

  this.set('timestamp', moment());

  this.render(hbs`{{paper-time-picker timestamp=timestamp}}`);

  assert.equal(this.$('.hours-header').hasClass('active'), true);
  assert.equal(this.$('.minutes-header').hasClass('inactive'), true);

  this.$('.minutes-header').click();

  assert.equal(this.$('.hours-header').hasClass('inactive'), true);
  assert.equal(this.$('.minutes-header').hasClass('active'), true);

});
