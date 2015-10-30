var gulp = require('gulp');
var args = require('yargs').argv;
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var del = require('del');
var config = require('./gulp.config.js')();
var port = process.env.PORT || config.defaultPort;


gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('jshint', function () {
  log('Analyzing source with JSHint and JSCS');
  return gulp.src([
    'src/app/**/*.js',
    '!src/app/bower_components/**/*.js'
  ])
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', {verbose: true}));
});

gulp.task('styles', ['clean-styles'], function () {
  log('Compiling Less --> CSS');
  return gulp
    .src(config.less)
    .pipe($.less())
    .pipe($.plumber())
    .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.css))
    .pipe($.cssFlipper())
    .pipe($.rename({
      suffix: '-rtl'
    }))
    .pipe(gulp.dest(config.css));
});

gulp.task('fonts', ['clean-fonts'], function () {
  log('Copying fonts');
  return gulp
    .src(config.fonts)
    .pipe(gulp.dest(config.build + 'styles/fonts'));
});

gulp.task('images', ['clean-images'], function () {
  log('Copying images');
  return gulp
    .src(config.images)
    .pipe($.imagemin({optimizationLevel: 3}))
    .pipe(gulp.dest(config.build + 'styles/img'));
});

gulp.task('svg', ['clean-svg'], function () {
  log('Copying svg');
  return gulp
    .src(config.svg)
    .pipe($.svgmin())
    .pipe(gulp.dest(config.build + 'styles/img'));
});

gulp.task('clean-styles', function () {
  return gulp
    .src([config.build + 'styles/**/*.css', config.css + '**/*.css'], {read: false})
    .pipe($.clean({force: true}));
});

gulp.task('clean-fonts', function () {
  gulp
    .src(config.build + 'styles/fonts/**/*.*')
    .pipe($.clean());
});

gulp.task('clean-code', function (done) {
  var files = [].concat(
    config.temp + '**/*.js',
    config.build + '**/*.html',
    config.build + 'js/**/*.js'
  );
  return gulp
    .src(files)
    .pipe($.clean({force: true}));
});

gulp.task('clean-images', function () {
  gulp
    .src(config.build + 'styles/img/**/*.{png,jpg,jpeg,gif}')
    .pipe($.clean());
});

gulp.task('clean-svg', function () {
  gulp
    .src(config.build + 'styles/img/**/*.svg')
    .pipe($.clean());
});

gulp.task('templatecache', ['clean-code'], function () {
  return gulp
    .src(config.htmltemplates)
    .pipe($.print())
    .pipe($.minifyHtml({empty: true}))
    .pipe($.angularTemplatecache(
      config.templateCache.file,
      config.templateCache.options
    ))
    .pipe(gulp.dest(config.temp));
});

gulp.task('wiredep', function () {
  log('Wiring up th bower css, js and app js into html');
  var options = config.getWiredepDefaultOptions();
  var wiredep = require('wiredep').stream;

  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe($.inject(gulp.src(config.js), {relative: true}))
    .pipe(gulp.dest(config.client));
});

/*gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
 log('Wiring up th app css into html and call wiredep');
 return gulp
 .src(config.index)
 .pipe($.inject(gulp.src(config.mainCss), {relative: true}))
 .pipe(gulp.dest(config.client));
 });*/

gulp.task('optimize', ['styles', 'templatecache', 'fonts', 'images', 'svg'], function () {
  log('Optimizing javascript, css and html');
  var assets = $.useref.assets();
  var templateCache = config.temp + config.templateCache.file;
  var cssFilter = $.filter('**/*.css', {restore: true});
  var jsAppFilter = $.filter('**/app.js', {restore: true});
  var jsLibFilter = $.filter('**/lib.js', {restore: true});

  return gulp
    .src(config.index)
    .pipe($.plumber())
    .pipe($.inject(gulp.src(templateCache, {read: false}), {
      relative: true,
      starttag: '<!-- inject:templates:js -->'
    }))
    .pipe(assets)
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore)
    .pipe(jsLibFilter)
    .pipe($.uglify())
    .pipe(jsLibFilter.restore)
    .pipe(jsAppFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(jsAppFilter.restore)
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(gulp.dest(config.build));
});

gulp.task('serve', ['styles'], function () {
  serve(true);
});

gulp.task('serve-build', ['optimize'], function () {
  serve(false);
});

////////////////////////

function serve(isDev) {
  var nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    env: {
      'PORT': port,
      'NODE-ENV': isDev ? 'dev' : 'build'
    },
    watch: [config.serverWatch]
  };
  return $.nodemon(nodeOptions)
    .on('restart', function (ev) {
      log('*** nodemon restarted');
      log('files changed:\n' + ev);
      setTimeout(function () {
        browserSync.notify('reloading now ...');
        browserSync.reload({stream: false});
      }, config.browserReloadDelay);
    })
    .on('start', function () {
      log('*** nodemon started');
      startBrowserSync(isDev);
    })
    .on('crash', function () {
      log('*** nodemon crashed: script crashed for some reason');
    })
    .on('exit', function () {
      log('*** nodemon exited cleanly');
    });
}

function changeEvent(event) {
  var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
  log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync(isDev) {
  if (browserSync.active) {
    return;
  }

  log('Starting browser-sync on port ' + port);

  if (isDev) {
    gulp.watch([config.less], ['styles'])
      .on('change', changeEvent);
  } else {
    gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload])
      .on('change', changeEvent);
  }

  var options = {
    proxy: 'localhost:' + port,
    port: 3000,
    files: isDev ? [
      config.client + '**/*.*',
      !+config.less
    ] : [],
    ghostMode: { // these are the defaults t,f,t,t
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-app',
    notify: true,
    reloadDelay: 0 //1000
  };
  browserSync(options);
}

function clean(path, done) {
  log('Cleaning: ' + $.util.colors.blue(path));
  del(path, done);
}

function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}