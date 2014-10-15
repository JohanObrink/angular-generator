var q = require('q'),
  fs = require('fs'),
  path = require('path'),
  colors = require('colors'),
  init = require('../init'),
  fileHelper = require('../fileHelper'),
  log = require('../log');

module.exports = function (name) {
  var options;

  var values = {
    name: name,
    filename: name
  };

  log.info('Creating service: ' + name.yellow);

  return init.load()
    .then(function (_options) {
      options = _options;
      values.module = options.module;
      return fileHelper.getTemplates('service', values);
    })
    .then(function (templates) {
      return templates.reduce(function (map, tmpl) {
        map[tmpl.name] = tmpl;
        return map;
      }, {});
    })
    .then(function (tmplMap) {
      return q.all([
        fileHelper.saveFile(
          path.resolve(process.cwd(), options.sourceFolder, 'service', values.filename + '.js'),
          tmplMap['template.js'].content),
        fileHelper.saveFile(
          path.resolve(process.cwd(), options.testFolder, 'unit', 'service', values.filename + '.js'),
          tmplMap['test.js'].content)
      ]);
    });
};