const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
  	'app': ['babel-polyfill', './css/style.css', './js/app.js'],
  },
  
  module: {
  	rules: [{
  	  test: /\.js$/,
  	  exclude: [/node_modules/],
  	  loader: 'babel-loader'
  	  
  	},
  	{
  		test: /\.css$/,
  		use: [
  		  'style-loader',
  		  'css-loader'
  		]
  	},

  	{
  		test: /\.(png|svg|jpg|gif)$/,
  		use: [
  			'file-loader'
  		]
  	},
  	{
  		test: /\.(woff|woff2|eot|ttf|otf)$/,
  		use: [
  			'file-loader'
  		]
  	}]
  },
  
  plugins: [
  	
  	new CleanWebpackPlugin(['./public/'], {
  		root: '/home/ubuntu/workspace/piper-test-fullstack/'
  	}),
  	
  	new CopyWebpackPlugin([
  	  { from: './css/', to: '../css/'}
	  ])

  ],
	
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    path: path.resolve(__dirname, '../public/js')
  }
};