/**
 * @module Core/Handlers
 *
 */
import Base from './base';

export default Base.extend({
	__handler: 'date',

	active: Base.property(),
	open: Base.property(false),
	top: Base.property(false)
});
