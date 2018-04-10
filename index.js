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
    this.import('vendor/snapsvg/snap.svg.js', { using: [ { transformation: 'global', as: 'snapsvg', export: ['Snap', 'mina'] } ] });
  },

	importTransforms() {
    return {
      'global': {
        transform: (tree, options) => {
          let amdTransform = stew.map(tree, (content, relativePath) => {
            const name = options[relativePath].as;
            const _export = options[relativePath].export;
            if (name) {
							return defineValue(name, _export, content);
            } else {
              return content;
            }
          });

          return amdTransform;
        },
        processOptions: (assetPath, entry, options) => {
          if (!entry.as) {
            throw new Error(`while importing ${assetPath}: global transformation requires an \`as\` argument that specifies the desired module name`);
          }

					if (!entry.export) {
            throw new Error(`while importing ${assetPath}: global transformation requires an \`export\` argument [] that specifies the desired export values`);
          }

          // If the import is specified to be a different name we must break because of the broccoli rewrite behavior.
          if (Object.keys(options).indexOf(assetPath) !== -1 && options[assetPath].as !== entry.as) {
            throw new Error(`Highlander error while importing ${assetPath}. You may not import an global transformed asset at different module names.`);
          }

          options[assetPath] = {
            as: entry.as,
						export: entry.export
          };

          return options;
        },
      },
    };
  }
};

function defineValue(name, _export, content) {
	return `define(['${name}'], function() {\n` +
		`(function() { ${content} }).bind(window)();\n` +
		`return (function() {\n` +
			`let exports = {};\n` +
			`'${_export.join(',')}'.split(',').forEach(function(key) { exports[key] = window[key] });\n` +
			`return exports;\n` +
		`})();\n` +
	`});`;
}
