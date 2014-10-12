var q = require('q'),
  fs = require('fs'),
  path = require('path'),
  hogan = require('hogan');

function getTemplate(dir, subdir, filename) {
  var tmplCustom = process.cwd() + '/' + dir + '/' + subdir + '/' + filename;
  var tmplDefault = path.resolve('./templates/' + subdir + '/' + filename);
  
  var deferred = q.defer();

  fs.readFile(tmplCustom, function (err, tmpl) {
    if(err) {
      fs.readFile(tmplDefault, function (err, tmpl) {
        if(err) {
          deferred.reject(err);
        } else {
          deferred.resolve(tmpl);
        }
      });
    } else {
      deferred.resolve(tmpl);
    }
  });

  return deferred.promise;
}

function getTemplates(dir, subdir, filenames) {
  return q.all(filenames.map(function (file) {
    return getTemplate(dir, subdir, file);
  }));
}

function render(str, data) {
  return hogan.compile(str).render(data);
}

module.exports = {
  getTemplate: getTemplate,
  getTemplates: getTemplates,
  render: render
};