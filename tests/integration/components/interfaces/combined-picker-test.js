import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('interfaces/combined-picker', 'Integration | Component | combined picker', {
  integration: true
});

test('it renders', function(assert) {

    this.set('timestamp', moment().unix() * 1000);

    this.render(hbs`{{interfaces/combined-picker timestamp=timestamp instanceNumber="one"}}`);

    assert.ok(this.$().text().trim());
});

// test('toggle from clock to calender and back', function(assert) {
//
//     this.set('timestamp', moment().unix() * 1000);
//     console.log(moment(this.get('timestamp')));
//     let time = moment(this.get('timestamp')).format('hh:mm A');
//     let date = moment(this.get('timestamp')).format('MMM DD, YYYY');
//
//     this.render(hbs`{{interfaces/combined-picker timestamp=timestamp isMilliseconds=true instanceNumber="one"}}`);
//
//     this.$('.current-date').click();
//     assert.equal(this.$('.current-date').text(), time);
//
//     this.$('.current-date').click();
//     assert.equal(this.$('.current-date').text(), date);
// });
