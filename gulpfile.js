const gulp = require("gulp");
const zip = require("gulp-zip");

exports.default = () =>
  gulp.src("dist/**/*.*").pipe(zip("app.zip")).pipe(gulp.dest("."));
