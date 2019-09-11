const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('compile', shell.task([
    'tsc'
]));

gulp.task('compile:docs', shell.task([
    'jsdoc2md --no-cache --files ./src/*.ts --configure ./jsdoc2md.json > ./docs/API.md'
]));

gulp.task('clean:dist', shell.task([
    'del-cli ./dist'
]));

gulp.task('test', shell.task([
    'mocha'
]));

gulp.task('test:coverage', shell.task([
    'nyc mocha'
]));

gulp.task('eslint', shell.task([
    'eslint --ext .ts .'
]));

gulp.task('eslint:fix', shell.task([
    'eslint --ext .ts --fix .'
]));