var gulp = require('gulp');
var shell = require('gulp-shell');
var mocha = require('gulp-mocha');

gulp.task('compile', shell.task([
    'tsc'
]));

gulp.task('clean-dist', shell.task([
    'del-cli ./dist'
]));

gulp.task('mocha', async () => {
    await gulp.src('dist/tests/*.js', { read: false }).pipe(mocha());
});

gulp.task('test', gulp.series('compile', 'mocha'))