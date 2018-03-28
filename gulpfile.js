var gulp = require("gulp");
var sass = require("gulp-sass");

// Compile sass into CSS & auto-inject into browsers
gulp.task("sass", function() {
    return gulp
        .src("scss/**/*.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(gulp.dest("css"));
});

gulp.task("default", function() {
    gulp.watch("scss/**/*.scss", ["sass"]);
});
