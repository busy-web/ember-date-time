/**
 * @module Core/Handlers
 *
 */
import { on } from '@ember/object/evented';
import { set } from '@ember/object';
import Base from './base';
import moment from 'moment';
import { getMapAttr } from '../utils/map';

export default Base.extend({
	__handler: 'formatter',

	format: Base.property({ defaultValue: 'L' }),
	normalizedFormat: Base.property(),

	setup: on('setupAttrs', function(attrs) {
		if (getMapAttr(attrs, 'format.value')) {
			const localeData = moment.localeData();
			let format = getMapAttr(attrs, 'format.value');
			let fsp = format.split(' ');
			let nfsp = fsp.map(i => localeData.longDateFormat(i));
			let nf = nfsp.join(' ');
			set(this, 'normalizedFormat', nf);
		}
	})
});
