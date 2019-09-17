const DtsBundleWebpack = require('dts-bundle-webpack')

module.exports = {
  mode: 'production',
  entry: './core.ts',
  output: {
    libraryTarget: 'commonjs',
    filename: 'index.js',
    path: __dirname
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  target: 'node',
  optimization: {
    minimize: false
  },
  plugins: [
    new DtsBundleWebpack({
      name: 'node-x12',
      baseDir: './',
      main: 'dist/core.d.ts',
      out: 'index.d.ts'
    })
  ]
}