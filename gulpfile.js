var gulp = require('gulp');
var shell = require('gulp-shell');
var mocha = require('gulp-mocha');

gulp.task('compile', shell.task([
    'tsc'
]));

gulp.task('test', ['compile'], function () {
    gulp.src('tests/*.js', { read: false }).pipe(mocha());
});