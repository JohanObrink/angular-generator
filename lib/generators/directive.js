var q = require('q'),
  inquirer = require('inquirer'),
  fs = require('fs'),
  path = require('path'),
  colors = require('colors'),
  init = require('../init'),
  fileHelper = require('../fileHelper'),
  scriptHelper = require('../scriptHelper'),
  namer = require('../namer'),
  log = require('../log');

function prompt() {
  var deferred = q.defer();
  /*.prompt([
    {
      type: 'confirm',
      name: 'directiveType',
      message: 'Do you want a template html and css?',
      default: true
    }
  ], function (answers) {
    deferred.resolve(answers.directiveType);
  });*/
  return deferred.promise;
}

module.exports = function (name) {
  var options, directiveType;

  var values = {
    name: namer.directive(name),
    filename: namer.file(namer.directive(name))
  };

  log.info('Creating directive: ' + name.cyan);

  return prompt()
    .then(function (_useHtml) {
      directiveType = _useHtml ? 'element' : 'attribute';
      return init.load();
    })
    .then(function (_options) {
      options = _options;
      values.module = options.module;
      return fileHelper.getTemplates('directive', values);
    })
    .then(function (templates) {
      return templates.reduce(function (map, tmpl) {
        map[tmpl.name] = tmpl;
        return map;
      }, {});
    })
    .then(function (tmplMap) {
      var files = [];

      files.push(fileHelper.saveFile(
        path.resolve(process.cwd(), options.sourceFolder, 'directives', values.filename + '.js'),
        tmplMap['template-' + directiveType + '.js'].content));
      if(directiveType === 'element') {
        files.push(fileHelper.saveFile(
          path.resolve(process.cwd(), options.sourceFolder, 'directives', values.filename + '.js'),
          tmplMap['template.html'].content));
      }
      files.push(fileHelper.saveFile(
          path.resolve(process.cwd(), options.testFolder, 'unit', 'directives', values.filename + '.js'),
          tmplMap['test-' + directiveType + '.js'].content));

      return q.all(files);
    })
    .then(function () {
      return scriptHelper.insertScripts({
        name: values.filename,
        type: 'directive',
        codePath: 'directives',
        testPath: 'directives'
      });
    });
};