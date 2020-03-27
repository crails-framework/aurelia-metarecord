const gulp   = require('gulp');
const babel  = require('gulp-babel');
const path   = require('path');
const concat = require('gulp-concat');

const babelOptions = babel({
  filename: '',
  filenameRelative: '',
  sourceMap: true,
  sourceRoot: '',
  moduleRoot: path.resolve(`src`).replace(/\\/g, '/'),
  moduleIds: false,
  comments: false,
  compact: false,
  code: true,
  plugins: [
    'syntax-flow',
    'transform-es2015-modules-commonjs'
  ]
});

gulp.task('build', function() {
  return gulp.src("src/**/*.js")
             .pipe(babelOptions)
             .pipe(concat("index.js"))
             .pipe(gulp.dest("./dist/"));
});
