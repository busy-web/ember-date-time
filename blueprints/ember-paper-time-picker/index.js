/* jshint node: true */
'use strict';

module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
		var _this = this;
	//	return _this.addAddonToProject('ember-snap-svg@0.0.6').then(function() {
				return _this.addAddonToProject('ember-moment@6.1.0');
	//	});
  }
};
