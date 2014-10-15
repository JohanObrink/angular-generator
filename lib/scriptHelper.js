var fs = require('fs'),
  path = require('path'),
  q = require('q'),
  init = require('./init'),
  ejs = require('ejs');

function insertIn(html, script, part) {
  return html;
}

function insertScript(type, name) {

  var appHtmlPath, testHtmlPath;

  return init.load()
    .then(function (options) {
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

      return q.all([
        q.nfcall(fs.writeFile, appHtmlPath, appHtml),
        q.nfcall(fs.writeFile, testHtmlPath, testHtml)
      ]);
    });
}

module.exports = {
  insertScript: insertScript,
  insertIn: insertIn
};