var browserify = require('browserify'),
    del = require('del'),
    exec = require('child_process').exec,
    fs = require('fs'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    path = require('path'),
    merge = require('merge-stream'),
    mkdirp = require('mkdirp'),
    ngAnnotate = require('gulp-ng-annotate'),
    sequence = require('gulp-sequence'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    stylus = require('gulp-stylus'),
    uglify = require('gulp-uglify')

function getFolders(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory()
  })
}

function buildCoffeescript(srcDir, targetFile, destDir) {
  return gulp.src([
      'src/' + srcDir + '/**/module.coffee',
      'src/' + srcDir + '/**/*.coffee'])
    .pipe(sourcemaps.init())
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(concat(targetFile))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(destDir))
}

function buildJavascript(srcDir, targetFile, destDir) {
  return gulp.src([
      'src/' + srcDir + '/**/module.js',
      'src/' + srcDir + '/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat(targetFile))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(destDir))
}

function buildCss(srcDir, targetFile, destDir) {
  return gulp.src('src/' + srcDir + '/**/*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus({compress: true}))
    .pipe(concat(targetFile))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(destDir))
}

function buildHtml(baseDir, srcDir, destDir) {
  return gulp.src(baseDir + '/' + srcDir + '/**/*.html', {base: baseDir})
    .pipe(gulp.dest(destDir))
}

gulp.task('clean', function() {
  del('pkg')
})

gulp.task('preamble', function() {
  mkdirp('pkg')
  gulp.src('package.json').pipe(gulp.dest('pkg'))
})

gulp.task('thirdparty:js', function() {
  mkdirp('pkg')
  browserify('src/thirdparty.js')
    .bundle()
    .pipe(source('thirdparty.min.js'))
    .pipe(gulp.dest('pkg'))
})

gulp.task('thirdparty:css', function() {
  mkdirp('pkg')
  gulp.src([
      'node_modules/angular-material/angular-material.min.css',
      //'node_modules/bootstrap/dist/css/bootstrap.min.css'
      ])
    .pipe(concat('thirdparty.min.css'))
    .pipe(gulp.dest('pkg'))
})

gulp.task('common:js', function() {
  mkdirp('pkg')
  return buildCoffeescript('common', 'common.min.js', 'pkg')
})

gulp.task('common:css', function() {
  mkdirp('pkg')
  return buildCss('common', 'common.min.css', 'pkg')
})

gulp.task('common:html', function() {
  mkdirp('pkg')
  return buildHtml('src', 'common', 'pkg')
})

gulp.task('app:js', function() {
  mkdirp('pkg')
  gulp.src('src/app.js').pipe(gulp.dest('pkg'))
  gulp.src('src/app/**', {base: './src'}).pipe(gulp.dest('pkg'))
})

gulp.task('components:js', function() {
  return getFolders('src/components').map(function(folder) {
    mkdirp('pkg/' + folder)
    return buildJavascript('components/' + folder, folder + '.min.js', 'pkg/' + folder)
  })
})

gulp.task('components:css', function() {
  return getFolders('src/components').map(function(folder) {
    mkdirp('pkg/' + folder)
    return buildCss('components/' + folder, folder + '.min.css', 'pkg/' + folder)
  })
})

gulp.task('components:html', function() {
  return getFolders('src/components').map(function(folder) {
    mkdirp('pkg/' + folder)
    return buildHtml('src/components', folder, 'pkg')
  })
})

gulp.task('build:full',
  sequence('clean', 'preamble', 'thirdparty:js', 'thirdparty:css',
           'common:js', 'common:css', 'common:html', 'app:js',
           'components:js', 'components:css', 'components:html')
)

gulp.task('build',
  sequence('common:js', 'common:css', 'common:html', 'app:js',
           'components:js', 'components:css', 'components:html')
)

gulp.task('package', function(cb) {
  mkdirp('dist')
  del('dist/ephemeral.asar')
  exec('node_modules/.bin/asar pack pkg dist/ephemeral.asar', function(err, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    cb(err)
  })
})

gulp.task('watch', function() {
  gulp.watch('src/thirdparty.js', ['thirdparty:js'])
  gulp.watch(['src/common/*.js', 'src/common/**/*.js'], ['common:js'])
  gulp.watch(['src/common/*.styl', 'src/common/**/*.styl'], ['common:css'])
  gulp.watch(['src/common/*.html', 'src/common/**/*.html'], ['common:html'])
  gulp.watch(['src/app.js', 'src/app/*.js', 'src/app/**/*.js'], ['app:js'])
  gulp.watch('src/components/**/*.js', ['components:js'])
  gulp.watch('src/components/**/*.styl', ['components:css'])
  gulp.watch('src/components/**/*.html', ['components:html'])
})
