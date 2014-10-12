var q = require('q'),
  fs = require('fs'),
  init = require('../init'),
  templatesHelper = require('../templatesHelper');

module.exports = function (name) {
  var options;
  return init
    //get options
    .load()
    //get templates
    .then(function (_options) {
      options = _options;
      return templatesHelper
        .getTemplates(options.templatesFolder, 'service', ['template.js', 'test.js']);
    })
    //customize templates
    .then(function (templates) {
      return templates;
    });
    //save templates
};