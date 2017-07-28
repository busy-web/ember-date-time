/**
 * @module Helpers
 *
 */
import Ember from 'ember';
import { i18n } from 'busy-utils';

/**
 * `Helper/BusyLoc`
 *
 * @class BusyLoc
 * @namespace Helpers
 * @extends Ember.Helper
 */
export default Ember.Helper.extend({
	/**
	 * Helpers compute override mehtod and main entry
	 * mehtod of the template helper
	 *
	 * @public
	 * @method compute
	 * @param params {array} mixed values passed from the template
	 * @return {string} the localized string
	 */
	compute(params) {
		const string = params[0];
		const args = params.slice(1, params.length);

		return i18n(string, args);
	},
});
