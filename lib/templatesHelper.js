var q = require('q'),
  fs = require('fs'),
  path = require('path'),
  hogan = require('hogan'),
  init = require('./init');

var options;
function getOptions() {
  if(options) {
    return q(options);
  } else {
    return init.load().then(function (_options) {
      options = _options;
      return options;
    });
  }
}

function listTemplates(type) {
  var defaultFolder, customFolder;
  return getOptions()
    .then(function (options) {
      defaultFolder = path.resolve('./templates/', type);
      customFolder = path.resolve(process.cwd(), options.templatesFolder, type);
      return q.all([
        q.nfcall(fs.readdir, defaultFolder),
        q.nfcall(fs.readdir, customFolder).catch(function () { return []; })
      ]);
    })
    .then(function (lists) {
      return lists[0]
        .filter(function (file) { return lists[1].indexOf(file) === -1; })
        .map(function (file) { return { name: file, path: defaultFolder + '/' + file }; })
        .concat(lists[1]
          .map(function (file) { return { name: file, path: customFolder + '/' + file }; }));
    });
}

function render(str, data) {
  return hogan.compile(str).render(data);
}

function getTemplates(type, values) {
  return listTemplates(type)
    .then(function (templates) {
      return q.all(templates.map(function (template) {
        return q.nfcall(fs.readFile, template.path)
          .then(function (tmpl) {
            template.template = tmpl;
            template.content = render(tmpl, values);
            return template;
          });
      }));
    });
}

module.exports = {
  listTemplates: listTemplates,
  getTemplates: getTemplates,
  render: render
};