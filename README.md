ember-paper-time-picker
==============================================================================

[![npm version](https://badge.fury.io/js/ember-paper-time-picker.svg)](https://badge.fury.io/js/ember-paper-time-picker)

[![Build Status](https://travis-ci.org/busybusy/webapp-ember-paper-time-picker.svg?branch=master)](https://travis-ci.org/busybusy/webapp-ember-paper-time-picker)

[![Ember Observer Score](https://emberobserver.com/badges/ember-paper-time-picker.svg)](https://emberobserver.com/addons/ember-paper-time-picker)
[![Ember badge][ember-badge]][embadge]

[![Code Climate](https://codeclimate.com/github/busybusy/webapp-ember-paper-time-picker/badges/gpa.svg)](https://codeclimate.com/github/busybusy/webapp-ember-paper-time-picker)
[![Test Coverage](https://codeclimate.com/github/busybusy/webapp-ember-paper-time-picker/badges/coverage.svg)](https://codeclimate.com/github/busybusy/webapp-ember-paper-time-picker/coverage)
[![Issue Count](https://codeclimate.com/github/busybusy/webapp-ember-paper-time-picker/badges/issue_count.svg)](https://codeclimate.com/github/busybusy/webapp-ember-paper-time-picker)

[ember cli](https://ember-cli.com/) addon for a Paper like date picker

Installation
------------------------------------------------------------------------------

Install this addon using ember-cli
```
ember install ember-paper-time-picker
```

Usage
------------------------------------------------------------------------------

Use ember-jsignature in your template:
```
// basic datetime picker
{{paper-datetime-picker timestamp=model.picker0.standard.timestamp}}

// basic datetime picker with unix timestamp
{{paper-datetime-picker unix=model.picker1.seconds.timestamp}}
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

[embadge]: http://embadge.io/
[ember-badge]: http://embadge.io/v1/badge.svg?start=2.14.0
