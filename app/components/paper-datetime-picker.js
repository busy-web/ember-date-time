import EmberDateTimePicker from '@busy-web/ember-date-time/components/ember-date-time-picker';
import { deprecate } from '@ember/application/deprecations';

(function() {
	deprecate('{{paper-datetime-picker}} has been changed to {{ember-date-time-picker}}. Please migrate to use this.', false, { id: '@busy-web-ember-date-time-paper-datetime-picker', until: 'v2.4.0' });
})();

export default EmberDateTimePicker;
