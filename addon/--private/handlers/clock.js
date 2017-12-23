/**
 * @module Core/Handlers
 *
 */
import Base from './base';

export default Base.extend({
	__handler: 'clock',

	round: Base.property({ defaultValue: 1 }),
	roundSelect: Base.property({ defaultValue: 1 })
});
