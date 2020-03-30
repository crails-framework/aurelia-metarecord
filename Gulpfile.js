const gulp   = require("gulp");
const babel  = require("gulp-babel");
const concat = require("gulp-concat");

gulp.task("build", function() {
  return gulp.src("src/**/*.js")
             .pipe(babel({presets: ['es2015'], plugins: ["transform-es2015-modules-amd"]}))
             .pipe(concat("index.js"))
             .pipe(gulp.dest("dist/"));;
});
