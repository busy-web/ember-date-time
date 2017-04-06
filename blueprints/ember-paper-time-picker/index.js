/* eslint-env node */
'use strict';

module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addAddonsToProject({packages: ['ember-snap-svg@0.0.6', 'busy-utils@2.3.6']});
  }
};
