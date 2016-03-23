/*eslint-disable */
var gulp = require('gulp');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var watch = require('gulp-watch');
var babel = require('gulp-babel');

function handleErrors() {
 var args = Array.prototype.slice.call(arguments);
 notify.onError({
   title : 'Compile Error',
   message : '<%= error.message %>'
 }).apply(this, args);
 this.emit('end');
}

gulp.task('default', ['server', 'react', 'test', 'main', 'css', 'watch']);

gulp.task('server', () => {
  return gulp.src('./app/src/server/*')
    .pipe(babel( {plugins: [
        'transform-es2015-modules-commonjs',
        'transform-es2015-shorthand-properties',
        'transform-es2015-parameters'
      ]}
    ))
    .on('error', handleErrors)
    .pipe(gulp.dest('./app/build/server'));
});

gulp.task('main', () => {
  return gulp.src('./app/src/main.js')
    .pipe(babel( {plugins: ['transform-es2015-modules-commonjs', 'transform-es2015-shorthand-properties']} ))
    .on('error', handleErrors)
    .pipe(gulp.dest('./app/build'));
});


gulp.task('react', () => {

  const bundler = browserify({
    entries: ['./app/src/client/index.js'],
    transform: babelify.configure({presets: ["react", "es2015"]}),
    debug: true,
    fullPaths: true
  })

  bundler.external(['react', 'react-dom', 'ramda', 'react-router', 'electron', './build/server/projConfig.js']);

  return bundler
    .bundle()
    .on('error', handleErrors)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./app/build/client'))
});

gulp.task('test', () => {
  return gulp.src('test/tests.js')
  .pipe(babel({plugins: ['transform-es2015-modules-commonjs', 'transform-es2015-shorthand-properties']}))
  .pipe(rename('tests-compiled.js'))
  .on('error', handleErrors)
  .pipe(gulp.dest('./test/'));
});

gulp.task('css', () => {
  return gulp.src('./app/src/client/css/*')
    .pipe(gulp.dest('./app/build/client/css'))
})

gulp.task('watch', function() {
  gulp.watch(['./app/src/server/*',], ['server']);
  gulp.watch('./test/tests.js', ['test']);
  gulp.watch('./app/src/main.js', ['main']);
  gulp.watch(['./app/src/client/index.js', 'app/src/client/components/*.js'], ['react']);
  gulp.watch('./app/src/client/css/*', ['css']);
});
