var fs = require('fs'),
  path = require('path'),
  q = require('q'),
  init = require('./init'),
  log = require('./log'),
  colors = require('colors'),
  ejs = require('ejs');

function createScriptTag(pagePath, scriptPath) {
  var src = path.relative(path.dirname(pagePath), scriptPath);
  return '<script src="' + src + '"></script>';
}

function insertIn(html, script, part) {
  var rx = new RegExp('([ \t]*)<!-- \/'+part+' -->');
  var matches = html.match(rx);
  return html.replace(matches[0], matches[1] + script + '\n' + matches[0]);
}

function insertScript(type, name) {

  var appHtmlPath, testHtmlPath, options;

  return init.load()
    .then(function (_options) {
      options = _options;
      appHtmlPath = path.resolve(process.cwd(), 'index.html');
      testHtmlPath = path.resolve(process.cwd(), options.testFolder, 'unit', 'index.html');

      var loadAppHtml = q.nfcall(fs.readFile, appHtmlPath, {encoding:'utf8'})
        .catch(function () {
          var file;
          return q.nfcall(fs.readFile, path.resolve(__dirname, '../templates/app.html'), {encoding:'utf8'})
            .then(function (_file) {
              file = ejs.render(_file, options);
              return q.nfcall(fs.writeFile, appHtmlPath, file);
            })
            .then(function () {
              return file;
            });
        });

      var loadTestHtml = q.nfcall(fs.readFile, testHtmlPath, {encoding:'utf8'})
        .catch(function () {
          var file;
          return q.nfcall(fs.readFile, path.resolve(__dirname, '../templates/test.html'), {encoding:'utf8'})
            .then(function (_file) {
              file = ejs.render(_file, options);
              return q.nfcall(fs.writeFile, testHtmlPath, file);
            })
            .then(function () {
              return file;
            });
        });
      return q.all([loadAppHtml, loadTestHtml]);
    })
    .then(function (htmls) {
      var appHtml = htmls[0];
      var testHtml = htmls[1];

      var codePath = path.resolve(options.sourceFolder, type, name);
      var testPath = path.resolve(options.testFolder, 'unit', type, name);

      try {
        appHtml = insertIn(appHtml, createScriptTag(appHtmlPath, codePath), type);
        log.info('Inserted ' + name.cyan + ' in app HTML');
      } catch(err) {
        log.warn('Could not find insertion point for '
          + type.yellow
          + ' script '
          + name.yellow
          + ' in app HTML file.');
      }

      try {
        testHtml = insertIn(testHtml, createScriptTag(testHtmlPath, codePath), type);
        log.info('Inserted ' + name.cyan + ' in test HTML');
      } catch(err) {
        log.warn('Could not find insertion point for '
          + type.yellow
          + ' script '
          + name.yellow
          + ' in test HTML file.');
      }

      try {
        testHtml = insertIn(testHtml, createScriptTag(testHtmlPath, testPath), type + ' test');
        log.info('Inserted ' + (name + ' test').cyan + ' in test HTML');
      } catch(err) {
        log.warn('Could not find insertion point for '
          + (type + ' test').yellow
          + ' script '
          + name.yellow
          + ' in test HTML file.');
      }

      return q.all([
        q.nfcall(fs.writeFile, appHtmlPath, appHtml),
        q.nfcall(fs.writeFile, testHtmlPath, testHtml)
      ]);
    });
}

module.exports = {
  createScriptTag: createScriptTag,
  insertScript: insertScript,
  insertIn: insertIn
};