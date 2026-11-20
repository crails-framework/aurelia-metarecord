import gulp from "gulp";
import babel from "gulp-babel";

gulp.task("build", function() {
  return gulp.src("src/**/*.js")
             .pipe(babel({presets: ["@babel/preset-env"]}))
             .pipe(gulp.dest("dist/"));
});
