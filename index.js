/* eslint-env node */
'use strict';

const stew = require('broccoli-stew');

module.exports = {
  name: '@busy-web/ember-date-time',

  options: {
		nodeAssets: {
			//"eve": {
			//	vendor: ['eve.js'],
			//},
      "snapsvg": {
        srcDir: 'dist',
				destDir: 'snapsvg',
        vendor: ['snap.svg.js']
        //import: ['mina.js', 'svg.js']
      },
    }
  },

  included() {
    this._super.included.apply(this, arguments);
    //this.import('vendor/eve/eve.js', { using: [ { transformation: 'amd', as: 'eve' } ] });
    this.import('vendor/snapsvg/snap.svg.js', { using: [ { transformation: 'global', as: 'snapsvg' } ] });
  },

	importTransforms() {
    return {
      'global': {
        transform: (tree, options) => {
          let amdTransform = stew.map(tree, (content, relativePath) => {
            const name = options[relativePath].as;
            if (name) {
							return defineValue(name, content);
            } else {
              return content;
            }
          });

          return amdTransform;
        },
        processOptions: (assetPath, entry, options) => {
          if (!entry.as) {
            throw new Error(`while importing ${assetPath}: amd transformation requires an \`as\` argument that specifies the desired module name`);
          }

          // If the import is specified to be a different name we must break because of the broccoli rewrite behavior.
          if (Object.keys(options).indexOf(assetPath) !== -1 && options[assetPath].as !== entry.as) {
            throw new Error(`Highlander error while importing ${assetPath}. You may not import an AMD transformed asset at different module names.`);
          }

          options[assetPath] = {
            as: entry.as,
          };

          return options;
        },
      },
    };
  }
};

function defineValue(name, content) {
return `define(['${name}'], function() {
	return (function(self) {
		const window = Object.assign({}, self);
		return (function() {
			${content}
			let result = Object.keys(window).filter(i => !self.hasOwnProperty(i));
			let ret = {};
			result.forEach(key => ret[key] = window[key]);
			console.log(ret);
			return ret;
		}).bind(window)();
	})(window);
});`
}
