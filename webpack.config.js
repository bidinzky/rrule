const webpack = require("webpack");
const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const paths = {
  source: path.resolve(__dirname, 'src'),
  es5: path.resolve(__dirname, "dist", "es5"),
  esm: path.resolve(__dirname, "dist", "esm")
};

const commonConfig = {
  output: {
    filename: '[name].js',
    path: paths.es5,
    library: 'rrule',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  devtool: 'source-map',
  mode: 'production',
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: "ts-loader",
        test: /\.ts$/
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        exclude: /\.ts$/,
        include: /\.min\.js$/
      })
    ]
  }
};

const rruleConfig = Object.assign({
  entry: {
    rrule: path.join(paths.source, "index.ts"),
    'rrule.min': path.join(paths.source, "index.ts")
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/^luxon$/, './fake-luxon.ts'),
  ]
}, commonConfig);

const rruleWithLuxonConfig = Object.assign({
  entry: {
    'rrule-tz': path.join(paths.source, "index.ts"),
    'rrule-tz.min': path.join(paths.source, "index.ts")
  },
}, commonConfig);


module.exports = [rruleConfig, rruleWithLuxonConfig];
