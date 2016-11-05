/* eslint import/no-extraneous-dependencies:0 */
const webpack = require('webpack');

module.exports = {
  entry: {
    obercube: './src/client/app.jsx'
  },

  output: {
    path: `${__dirname}/dist/`,
    publicPath: '/dist/',
    filename: './[name].js'
  },

  module: {
    loaders: [
      {
        test: /\.jsx/,
        loader: 'babel',
        include: `${__dirname}/src`,
        query: {
          presets: ['es2015', 'stage-0', 'react'],
          plugins: ['react-hot-loader/babel']
        }
      }
    ]
  },

  devServer: {
    historyApiFallback: true,
    noInfo: true
  },

  devtool: 'eval-source-map'
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = 'source-map';

  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]);
}
