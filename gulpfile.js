'use strict';
var gulp = require('gulp');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var notify = require('gulp-notify');
var rename = require('gulp-rename');

function handleErrors() {
 var args = Array.prototype.slice.call(arguments);
 notify.onError({
   title : 'Compile Error',
   message : '<%= error.message %>'
 }).apply(this, args);
 this.emit('end');
}

gulp.task('default', ['core', 'react', 'test', 'watch']);

gulp.task('core', () => {
  return gulp.src('app/src/*.js')
    .on('error', handleErrors)
    .pipe(babel( {plugins: ['transform-es2015-modules-commonjs', 'transform-es2015-shorthand-properties']} ))
    .pipe(gulp.dest('app/lib'));
});

gulp.task('react', () => {
	return gulp.src('app/src/components/*.js')
  .on('error', handleErrors)
    .pipe(babel( {presets: ['react','es2015']} ))
		.pipe(gulp.dest('app/lib/components'));
});

gulp.task('test', () => {
  return gulp.src('test/tests.js')
  .on('error', handleErrors)
  .pipe(babel({plugins: ['transform-es2015-modules-commonjs', 'transform-es2015-shorthand-properties']}))
  .pipe(rename('tests-compiled.js'))
  .pipe(gulp.dest('test/'));
});

gulp.task('watch', function() {
  gulp.watch('app/src/*.js', ['core']);
  gulp.watch('app/src/components/*.js', ['react']);
  gulp.watch('test/tests.js', ['test']);
});
