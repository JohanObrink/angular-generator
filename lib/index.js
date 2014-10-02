var gulp = require('gulp'),
  Q = require('q');

var yargs = require('yargs');

var init = require('./init'),
  partial = require('./partial');

function generate() {
  var argv = yargs
    .alias('i', 'init')
    .alias('p', 'partial')
    .alias('c', 'controller')
    .alias('s', 'service')
    .alias('d', 'directive')
    .alias('f', 'filter')
    .alias('m', 'model')
    .alias('c', 'constant')
    .argv;

  var result = Q();

  // init
  if(argv.init !== undefined) {
    result = result.then(init.bind(init));
  }

  // partial
  if(argv.partial !== undefined) {
    result = result.then(partial.bind(partial, argv.partial));
  }

  return result;
}

gulp.task('generate', generate);

module.exports = {
  generate: generate,
  init: init,
  partial: partial
};