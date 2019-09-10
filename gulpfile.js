const gulp = require('gulp');
const shell = require('gulp-shell');
const mocha = require('gulp-mocha');
const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');
const jsdoc2mdOptions = require('./jsdoc2md.json');

gulp.task('compile', shell.task([
    'tsc'
]));

gulp.task('compile:docs', shell.task([
    'jsdoc2md --no-cache --files ./src/*.ts --configure ./jsdoc2md.json > ./docs/API.md'
]));

gulp.task('clean:dist', shell.task([
    'del-cli ./dist'
]));

gulp.task('mocha', async (done) => {
    await gulp.src('dist/tests/*.js', { read: false }).pipe(mocha());

    return done()
});

gulp.task('test', gulp.series('compile', 'mocha'));