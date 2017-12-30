'use strict';

var gulp             = require('gulp'),
    del              = require('del'), // 刪除檔案
    gutil            = require("gulp-util"),
    concat           = require('gulp-concat'), // 合併檔案
    uglify           = require('gulp-uglify'), // 混淆壓縮
    minify           = require('gulp-minify'), // js 壓縮
    cleanCSS         = require('gulp-clean-css'),
    htmlmin          = require('gulp-htmlmin'), // html 壓縮
    cache            = require('gulp-cache'),  // 快取
    rename           = require('gulp-rename'), // 重新命名
    imagemin         = require('gulp-imagemin'), // 圖檔壓縮
    connect          = require('gulp-connect'), // web server
    browserify       = require('browserify'),
    source           = require('vinyl-source-stream'),
    buffer           = require('vinyl-buffer'),
    babelify         = require('babelify'),
    sourcemaps       = require('gulp-sourcemaps');

gutil.log('Environment', gutil.colors.cyan(gulp.env.production ? 'Production' : 'Development'));

// 來源資料夾
var ASSETS_DIR = 'src/';

// 輸出資料夾
var DIST_DIR = 'build/';

// src 資料夾
var DIR;

// web server
gulp.task('server', function(){
    connect.server({
      livereload: true
    });
});

var paths = {
  html: {dir: ASSETS_DIR, distDir: DIST_DIR},
  js: getPaths('js'),
  css : getPaths('css'),
  images: getPaths('images')
};

//HTML
gulp.task('html', function() {
  DIR = paths.html.dir;
  DIST_DIR = paths.html.distDir;

  var html_options = {};
  html_options = {
      removeComments: true,
      removeCommentsFromCDATA: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      collapseWhitespace: true
  };

  return gulp.src(DIR +'*.html')
    .pipe(htmlmin(html_options))
    .pipe(gulp.dest(DIST_DIR))
    .pipe(connect.reload());
});

// JS
gulp.task('js', function () {
    DIR = paths.js.dir;
    DIST_DIR = paths.js.distDir;

    // 預先刪除輸出資料夾js目錄內檔案
    var delFile = del([DIST_DIR + '/*.js']);

    var b = browserify({
      entries: [DIR + 'index.js'],
      transform: [babelify],
    })
    b.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./', {
                   includeContent: false,
                   sourceRoot: '../js'
                 }))
    .pipe(gulp.dest(DIST_DIR))
    .pipe(connect.reload())
    .on('error', handleError);

    var b2 = browserify({
      entries: [DIR + 'index.js'],
      transform: [babelify],
    })
    b2.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(gulp.dest(DIST_DIR))
    .pipe(connect.reload())
    .on('error', handleError);

});

// CSS
gulp.task('css', function () {
    DIR = paths.css.dir;
    DIST_DIR = paths.css.distDir;

    var delFile = del([DIST_DIR + '/*']);

    var contact;

    contact = gulp.src([DIR + '*.css'])
         // .pipe(sourcemaps.init())
         .pipe(concat('style.css'))
         .pipe(cleanCSS())
         .pipe(rename({ suffix: '.min' }))
          // 寫入sourcemaps到輸出資料夾，sourceRoot：輸出資料夾 css 位置
         // .pipe(sourcemaps.write('./', {
         //           includeContent: false,
         //           sourceRoot: '../css'
         //         }))
         .pipe(gulp.dest(DIST_DIR))
         .pipe(connect.reload());

    // var all;
    // all = gulp.src([DIR + '*.css'])
    //           .pipe(gulp.dest(DIST_DIR))
    //           .pipe(connect.reload());
});

// Images
gulp.task('images', function () {

    DIR = paths.images.dir;
    DIST_DIR = paths.images.distDir;

    var delFile = del([DIST_DIR + '/*']);

    var images = gulp.src([DIR + '**/*'])
      .pipe(imagemin({ optimizationLevel: 3,
                       progressive: true,
                       interlaced: true }))
      .pipe(gulp.dest(DIST_DIR))
      .pipe(connect.reload());
});


// 設定 NODE_ENV 為 production
gulp.task('apply-prod-environment', function() {
    process.env.NODE_ENV = 'production';
    //process.env.NODE_ENV = 'development';
});

var Tasks = [];
Tasks = ['server','css','js','images','html',
         'apply-prod-environment','watch'];

// Default task
gulp.task('default', Tasks, function (){

});

// Watch
gulp.task('watch', function() {
  gulp.watch(paths.html.dir + '*.html', ['html']);
  gulp.watch(paths.css.dir + '**/*.css', ['css']);
  gulp.watch(paths.js.dir + '**/*.js', ['js']);
  gulp.watch(paths.images.dir + '**/*', ['images']);
});


// get path
function getPaths (n) {
  let p = {};
  p.dir = ASSETS_DIR + n + '/';
  p.distDir = DIST_DIR + n ;
  return p
}

// handleError
function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}