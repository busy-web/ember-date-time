[![Build Status](https://travis-ci.org/busy-web/ember-date-time.svg?branch=master)](https://travis-ci.org/busy-web/ember-date-time)
[![npm version](https://badge.fury.io/js/%40busy-web%2Fember-date-time.svg)](https://badge.fury.io/js/%40busy-web%2Fember-date-time)
[![Maintainability](https://api.codeclimate.com/v1/badges/c4cab55b53739c2a883f/maintainability)](https://codeclimate.com/github/busy-web/ember-date-time/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c4cab55b53739c2a883f/test_coverage)](https://codeclimate.com/github/busy-web/ember-date-time/test_coverage)

@busy-web/ember-date-time
==============================================================================

Date time picker and date range picker for [ember cli](https://ember-cli.com/)

Installation
------------------------------------------------------------------------------

Install this addon using ember-cli
```
ember install @busy-web/ember-date-time
```

Usage
------------------------------------------------------------------------------

Use ember-jsignature in your template:
```
// basic datetime picker
{{ember-date-time-picker timestamp=model.picker0.standard.timestamp}}

// basic datetime picker with unix timestamp
{{ember-date-time-picker unix=model.picker1.seconds.timestamp}}
```

Documentation
------------------------------------------------------------------------------

Documentation can only be found by cloning the repo and running `ember server`
then viewing the page at `localhost:4200` in a browser.


Contributing
------------------------------------------------------------------------------

### Installation

* `git clone` this repository
* `npm install`
* `bower install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.

### Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).


License
------------------------------------------------------------------------------

[MIT License](https://opensource.org/licenses/mit-license.php)
