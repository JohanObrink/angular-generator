var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  mocha = require('gulp-mocha'),
  generator = require('./lib');

gulp.task('jshint', function () {
  return gulp.src(['lib/**/*.js', 'templates/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('mocha', function () {
  return gulp.src(['test/**/*.js'])
    .pipe(mocha({reporter:'spec'}));
});

gulp.task('test', ['jshint','mocha']);

gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js', 'templates/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('default', ['test','watch']);