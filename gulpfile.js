var source = require('vinyl-source-stream');
var gulp = require('gulp');
var tap = require('gulp-tap');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var watchify = require('watchify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');

var sass = require('gulp-sass');

var assetFiles = './assets/**/*';
var sassFiles = ['./sass/*.scss'];
var sources = ['./src/main.js'];
var destination = './build';
var onError = function(error) {
  gutil.log(gutil.colors.red(error.message));
};

var standalone = 'Okeyground';

gulp.task('lint', function() {
  return gulp.src('./src/main.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('prod', ['sass'], function() {
  return browserify('./src/main.js', {
    standalone: standalone
  }).transform('babelify',
               { presets: ["es2015"],
                 plugins: ['add-module-exports'] })
    .bundle()
    .on('error', onError)
    .pipe(source('okeyground.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(destination));
});

gulp.task('prod-watch', ['sass'], function() {
  var opts = watchify.args;
  opts.debug = true;
  opts.standalone = standalone;
  var bundleStream = watchify(browserify(sources, opts))
    .transform('babelify',
               { presets: ["es2015"],
                 plugins: ['add-module-exports'] })
    .on('update', rebundle)
    .on('log', gutil.log);

  function rebundle() {
    return bundleStream.bundle()
      .on('error', onError)
      .pipe(source('okeyground.min.js'))
      .pipe(gulp.dest(destination));
  }

  return rebundle();
});

gulp.task('assets', function() {
  var path = require('path');
  gulp.src(assetFiles)
    .pipe(gulp.dest(path.join(destination)));
});

gulp.task('sass', function() {
  return gulp.src(sassFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(destination));
});

gulp.task('dev', ['assets'], function() {
  var opts = watchify.args;
  opts.debug = true;
  opts.standalone = standalone;
  var bundleStream = watchify(browserify(sources, opts))
    .transform('babelify',
               { presets: ["es2015"],
                 plugins: ['add-module-exports'] })
    .on('update', rebundle)
    .on('log', gutil.log);

  function rebundle() {
    return bundleStream.bundle()
      .on('error', onError)
      .pipe(source('okeyground.js'))
      .pipe(gulp.dest(destination));
  }

  gulp.watch(sassFiles, ['sass']);

  return rebundle();
});

gulp.task('default', ['dev']);
