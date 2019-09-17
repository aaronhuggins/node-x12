const fs = require('fs')
const gulp = require('gulp')
const shell = require('gulp-shell')

gulp.task('mkdir', async (done) => {
  if (!fs.existsSync('coverage')) {
    fs.mkdirSync('coverage')
  }

  return done()
})

gulp.task('clean:dist', shell.task([
  'del-cli ./dist'
]))

gulp.task('clean:index', shell.task([
  'del-cli ./index.js ./index.d.ts'
]))

gulp.task('clean', gulp.parallel(
  'clean:dist',
  'clean:index'
))

gulp.task('compile', shell.task([
  'webpack'
]))

gulp.task('compile:docs', shell.task([
  'jsdoc2md --no-cache --files ./src/*.ts --configure ./jsdoc2md.json > ./docs/API.md',
  'mocha --reporter=markdown > ./docs/Tests.md'
]))

gulp.task('mocha', shell.task([
  'mocha'
]))

gulp.task('mocha:coverage', shell.task([
  'nyc mocha'
]))

gulp.task('mocha:xunit', shell.task([
  'nyc mocha --reporter=xunit --reporter-options output=./coverage/mocha.xml'
]))

gulp.task('eslint', shell.task([
  'eslint --ext .ts .'
]))

gulp.task('eslint:fix', shell.task([
  'eslint --ext .ts --fix .'
]))

gulp.task('eslint:xunit', shell.task([
  'eslint --format junit --ext .ts . > ./coverage/eslint.xml',
], {
  ignoreErrors: true
}))

gulp.task('codecov', shell.task([
  'codecov -t 710da1b2-17ab-40d3-86e3-d8cbce8b8ce3'
]))

gulp.task('test', gulp.parallel(
  gulp.series(
    'mkdir',
    'eslint:xunit'
  ),
  'mocha:xunit'
))

gulp.task('test:local', gulp.parallel(
  'eslint',
  'mocha:coverage'
))