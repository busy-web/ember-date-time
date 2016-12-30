/* globals blanket, module */

var options = {
  modulePrefix: 'ember-paper-time-picker',
  filter: '//.*ember-paper-time-picker/.*/',
  antifilter: '//.*(tests|template).*/',
  loaderExclusions: [],
  enableCoverage: true,
  cliOptions: {
		lcovOptions: {
			outputFile: 'lcov.info',
		},
    reporters: ['lcov'],
    autostart: false
  }
};
if (typeof exports === 'undefined') {
  blanket.options(options);
} else {
  module.exports = options;
}
