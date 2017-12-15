/* eslint-env node */
'use strict';

module.exports = {
  name: '@busy-web/ember-date-time',

  options: {
		nodeAssets: {
      "snapsvg": {
        srcDir: 'dist',
        import: ['snap-svg.js']
        //vendor: ['snap-svg.js']
      },
      //"@busybusy/data-sync-web-worker": {
      //  public: {
      //    destDir: 'workers',
      //    include: ['data-sync.js'],
      //  }
      //}
    },
  },

  //included() {
  //  this._super.included.apply(this, arguments);
  //  this.import('vendor/snapsvg/snap-svg.js'); //, { using: [ { transformation: 'amd', as: 'dexie' } ] });
  //}
};
