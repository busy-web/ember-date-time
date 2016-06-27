import Ember from 'ember';
// import moment from 'Moment';

export function formatDay(date/*, hash*/) {
  return date[0].date();
}

export default Ember.Helper.helper(formatDay);
