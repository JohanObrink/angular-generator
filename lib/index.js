var gulp = require('gulp'),
  q = require('q');

var yargs = require('yargs'),
  init = require('./init');

function generate() {
  var argv = yargs
    .alias('i', 'init')
    .alias('p', 'partial')
    .alias('c', 'controller')
    .alias('s', 'service')
    .alias('d', 'directive')
    .alias('f', 'filter')
    .alias('m', 'model')
    .alias('C', 'constant')
    .argv;

  var result = q();

  var generators = [
    'partial',
    'controller',
    'service',
    'directive',
    'filter',
    'model',
    'constant'
  ];

  // run init
  if(argv.init !== undefined) {
    result = result.then(init.bind(init));
  }

  // run generators
  generators.forEach(function (generator) {
    if(argv[generator] !== undefined) {
      var func = require('./generators/' + generator);
      result = result.then(func.bind(func, argv[generator]));
    }
  });

  return result;
}

gulp.task('generate', generate);

module.exports = {
  generate: generate,
  init: init
};