/* jshint node: true */
'use strict';

//var Funnel = require('broccoli-funnel');
//var mergeTrees = require('broccoli-merge-trees');
//var path = require('path');

module.exports = {
  name: 'ember-paper-time-picker',

	included(app) {
    this._super.included(app);

		// see: https://github.com/ember-cli/ember-cli/issues/3718
		while (typeof app.import !== 'function' && app.app) {
			app = app.app;
		}

		this.app = app;
//		this.importBrowserDeps(app);
  },

//  importBrowserDeps(app) {
//    if(app.import) {
//			var vendor = this.treePaths.vendor;
//			//app.import(vendor + '/crypto-js/crypto-js.js', {prepend: true});
//			//app.import(vendor + '/node-uuid/uuid.js', {prepend: true});
//			app.import('vendor/shims.js');
//		}
//	},
//
//	treeForVendor(vendorTree) {
//		var trees = [];
//
//		if (vendorTree) {
//			trees.push(vendorTree);
//		}
//
//	//	var cryptoPath = path.dirname(require.resolve('crypto-js'));
//
//	//	trees.push(new Funnel(cryptoPath, {
//	//		destDir: 'crypto-js',
//	//		include: [new RegExp(/\.js$/)]
//	//	}));
//
//	//	var nodeUUID = path.dirname(require.resolve('node-uuid'));
//
//	//	trees.push(new Funnel(nodeUUID, {
//	//		destDir: 'node-uuid',
//	//		include: [new RegExp(/\.js$/)]
//	//	}));
//
//		return mergeTrees(trees);
//	}
};
