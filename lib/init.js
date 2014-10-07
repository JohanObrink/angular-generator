var q = require('q'),
  inquirer = require("inquirer"),
  fs = require('fs');

var FILENAME = '/.generatorrc';
var options;

function isInitialized() {
  try {
    fs.statSync(process.cwd() + FILENAME);
    return true;
  } catch(err) {
    return false;
  }
}

function load() {
  var deferred = q.defer();
  if(options) {
    deferred.resolve(options);
  } else {
    fs.readFile(process.cwd() + FILENAME, function (err, _options) {
      if(err) {
        deferred.resolve({});
      } else {
        options = _options;
        deferred.resolve(JSON.parse(options));
      }
    });
  }
  return deferred.promise;
}

function prompt(options) {
  var deferred = q.defer();

  options.sourceFolder = options.sourceFolder || '';
  options.templatesFolder = options.templatesFolder || 'templates';
  options.buildFolder = options.buildFolder || 'dist';
  options.cssPrecompiler = options.cssPrecompiler || 'less';

  inquirer.prompt([
    {
      type: 'input',
      name: 'sourceFolder',
      message: 'Which folder will be your source folder for client side js?',
      default: options.sourceFolder
    },
    {
      type: 'input',
      name: 'templatesFolder',
      message: 'Which folder should be used for templates?',
      default: options.templatesFolder
    },
    {
      type: 'input',
      name: 'buildFolder',
      message: 'Name your build output folder',
      default: options.buildFolder
    },
    {
      type: 'list',
      name: 'cssPrecompiler',
      message: 'What css precompiler do you want to use?',
      choices: ['less', 'sass', 'stylus', 'plain css'],
      default: options.cssPrecompiler
    }
  ], function (answers) {
    deferred.resolve(answers);
  });
  return deferred.promise;
}

function save(options) {
  return q.nfcall(fs.writeFile, process.cwd() + FILENAME, JSON.stringify(options, null, 2));
}

module.exports = {
  load: load,
  save: save,
  prompt: prompt,
  isInitialized: isInitialized,
  initialize: function () { return load().then(prompt).then(save); }
};