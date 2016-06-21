import Ember from 'ember';
import layout from '../templates/components/paper-date-picker';

export default Ember.Component.extend({
    classNames: ['paper-date-picker'],
    layout: layout,

    timestamp: null,
    minDate: null,
    maxDate: null,
    format: null,
});
