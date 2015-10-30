module.exports = function () {
  var client = './src/app/';
  var config = {
    lintJs: [
      'src/app/**/*.js',
      '!src/app/bower_components/**/*.js'
    ],
    less: 'src/app/styles/less/main.less',
    temp: './.tmp/',
    css: client + 'styles/',
    index: client + 'index.html',
    js: [
      client + '**/*.module.js',
      client + '**/*.*.js',
      '!' + client + '**/*.spec.js',
      '!' + client + 'bower_components/**/*.js'
    ],
    html: client + '**/*.html',
    client: client,
    bower: {
      json: require('./bower.json'),
      directory: client + 'bower_components/',
      ignorePath: '../..'
    },
    mainCss: client + 'styles/main.css',
    nodeServer: './app.js',
    //@todo: include app.js
    serverWatch: './MockServer/',
    defaultPort: 7203,
    browserReloadDelay: 1000,
    build: './dist/',
    fonts: client + 'styles/fonts/**/*.*',
    images: client + 'styles/img/**/*.{png,jpg,jpeg,gif}',
    svg: client + 'styles/img/**/*.svg',
    htmltemplates: client + '**/*.tpl.html',
    templateCache: {
      file: 'template.js',
      options: {
        module: 'app.core',
        standAlone: false
      }
    }
  };

  config.getWiredepDefaultOptions = function () {
    var options = {
      bowerJson: config.bower.js,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };
    return options;
  };
  return config;
};