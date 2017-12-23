/**
 * @module Core/Handlers
 *
 */
import Base from './base';
import { computed, get, set } from '@ember/object';
import { isNone } from '@ember/utils';
import { on } from '@ember/object/evented';
import { normalizeTime/*, denormalizeTime*/ } from '../utils/time';
import { getMapAttr } from '../utils/map';

export default Base.extend({
	__handler: 'date',

	timestamp: Base.property(),
	unix: Base.property(),
	minDate: Base.property(),
	maxDate: Base.property(),
	utc: Base.property({ defaultValue: false }),

	// unix, timestamp get set to time and
	// minDate, maxDate get set to min, max
	// after the dates have been normalized.
	time: Base.property(),
	min: Base.property(),
	max: Base.property(),

	isUnix: computed('unix', function() {
		return !isNone(get(this, 'unix'));
	}),

	setup: on('setupAttrs', function(attrs) {
		this.updateTimes(attrs);
	}),

	update: on('updateAttrs', function(attrs) {
		if (getMapAttr(attrs, 'timestamp.value') || getMapAttr(attrs, 'unix.value') || getMapAttr(attrs, 'time.value')) {
			this.updateTimes(attrs);
		}
	}),

	updateTimes(attrs) {
		let isUTC = getMapAttr(attrs, 'utc.value') || false;
		let isUnix = getMapAttr(attrs, 'unix.value') ? true : false;

		if (getMapAttr(attrs, 'unix.value')) {
			let date = normalizeTime(getMapAttr(attrs, 'unix.value'), isUnix, isUTC);
			set(this, 'time', date);
		} else if (getMapAttr(attrs, 'timestamp.value')) {
			let date = normalizeTime(getMapAttr(attrs, 'timestamp.value'));
			set(this, 'time', date);
		}

		if (getMapAttr(attrs, 'minDate.value') || getMapAttr(attrs, 'maxDate.value')) {
			set(this, 'min', normalizeTime(getMapAttr(attrs, 'minDate.value')));
			set(this, 'max', normalizeTime(getMapAttr(attrs, 'maxDate.value')));
		}
	}
});
