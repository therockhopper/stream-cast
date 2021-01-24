const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const {GenerateSW} = require('workbox-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = env => {
  return {
    entry: {index: path.resolve(__dirname, 'src', 'index.js')},
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
      ],
    },
    optimization: {
      splitChunks: {chunks: 'all'},
    },
    plugins: [
      new Dotenv(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
        filename: 'index.html',
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'offline.html'),
        filename: 'offline.html',
      }),
      new WebpackPwaManifest({
        short_name: 'Cast',
        name: 'Cast Streams',
        description: 'Cast Streams',
        start_url: '/?source=pwa',
        scope: '/',
        theme_color: '#000',
        display: 'standalone',
      }),
      new GenerateSW({
        swDest: 'sw.js',
      }),
    ],
  };
};
