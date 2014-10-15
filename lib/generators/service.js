var q = require('q'),
  fs = require('fs'),
  path = require('path'),
  init = require('../init'),
  templatesHelper = require('../templatesHelper');

module.exports = function (name) {
  var options;

  var values = {
    name: name,
    filename: name
  };

  return init.load()
    .then(function (_options) {
      options = _options;
      values.module = options.module;
      return templatesHelper.getTemplates('service', values);
    })
    .then(function (templates) {
      return templates.reduce(function (map, tmpl) {
        map[tmpl.name] = tmpl;
        return map;
      }, {});
    })
    .then(function (tmplMap) {
      return q.all([
        q.nfcall(fs.writeFile,
          path.resolve(process.cwd(), options.sourceFolder, 'service', values.filename + '.js'),
          tmplMap['template.js'].content),
        q.nfcall(fs.writeFile,
          path.resolve(process.cwd(), options.testFolder, 'unit', 'service', values.filename + '.js'),
          tmplMap['test.js'].content)
      ]);
    })
    .then(function () {
      return true;
    });
};