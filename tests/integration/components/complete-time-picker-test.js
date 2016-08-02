import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('complete-time-picker', 'Integration | Component | complete time picker', {
  integration: true
});

test('it renders', function(assert) {

    this.set('timestamp', moment());

    this.render(hbs`{{complete-time-picker timestamp=timestamp}}`);

    assert.ok(this.$().text().trim());
});

test('toggle from clock to calender and back', function(assert) {

    this.set('timestamp', moment());
    let time = this.get('timestamp').format('hh:mm A');
    let date = this.get('timestamp').format('MMM DD, YYYY');

    this.render(hbs`{{complete-time-picker timestamp=timestamp}}`);

    this.$('.current-date').click();
    assert.equal(this.$('.current-date').text(), time);

    this.$('.current-date').click();
    assert.equal(this.$('.current-date').text(), date);
});
