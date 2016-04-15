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

gulp.task('default', ['server', 'react', 'main', 'css', 'images', 'html', 'bower', 'watch']);

gulp.task('server', () => {
  return gulp.src('./app/src/server/**/*')
    .pipe(babel( {plugins: [
        'transform-es2015-modules-commonjs',
        'transform-es2015-shorthand-properties',
        'transform-es2015-parameters',
        'transform-object-rest-spread'
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
    transform: babelify.configure({
      presets: ["react", "es2015"],
      plugins:["transform-object-rest-spread"],
    }),
    debug: true,
    fullPaths: true
  })

  bundler.external([
    'electron',
    'node-uuid',
    'react-redux',
    'redux',
    'redux-thunk',
    'redux-logger',
    'react-router-redux',
    'react',
    'react-dom',
    'ramda',
    'react-router',
    'moment',
    'chokidar',
    'bluebird',
    'react-tooltip',
    './server/main',
  ]);

  return bundler
    .bundle()
    .on('error', handleErrors)
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./app/build/client'))
});

gulp.task('css', () => {
  return gulp.src('./app/src/client/css/**/*')
    .pipe(gulp.dest('./app/build/client/css'))
})

gulp.task('images', () => {
  return gulp.src('./app/src/client/images/**/*')
    .pipe(gulp.dest('./app/build/client/images'))
})

gulp.task('html', () => {
  return gulp.src('./app/index.html')
    .pipe(gulp.dest('./app/build'))
})

gulp.task('bower', () => {
  return gulp.src('./bower_components/**/*')
    .pipe(gulp.dest('./app/build/client/bower_components'))
})

gulp.task('watch', function() {
  gulp.watch(['./app/src/server/**/*',], ['server']);
  gulp.watch('./app/src/main.js', ['main']);
  gulp.watch(['app/src/client/**/*.js'], ['react']);
  gulp.watch('./app/src/client/css/**/*', ['css']);
  gulp.watch('./app/src/client/images/**/*', ['images']);
  gulp.watch('./app/index.html', ['html']);
  gulp.watch('./bower_components/**/*', ['bower']);
});
