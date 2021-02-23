const gulp = require("gulp");
const zip = require("gulp-zip");
const inject = require("gulp-inject-string");

gulp.task("insert", function (done) {
  gulp
    .src("./dist/index-*.html")
    .pipe(
      inject.before(
        "<title>",
        '<script defer="defer" src="../vendorlib/vendor.js"></script>'
      )
    )
    .pipe(gulp.dest("./dist/"));
  console.log("Insert task done!");
  done();
});

gulp.task("zip", function (done) {
  gulp.src("dist/**/*.*").pipe(zip("app.zip")).pipe(gulp.dest("."));
  console.log("Zip task done");
  done();
});
