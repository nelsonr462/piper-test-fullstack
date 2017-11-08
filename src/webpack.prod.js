const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');


module.exports = merge(common, {
	plugins: [

		new webpack.optimize.UglifyJsPlugin(),

		new webpack.DefinePlugin({
			'process.env': { 'NODE_ENV': JSON.stringify('production') }
		}),

		new CompressionPlugin({
			asset: "[path].gz[query]",
			algorithm: "gzip",
			test: /app\.bundle\.js/,
			threshold: 0,
			minRatio: 2,
			deleteOriginalAssets: false
		}),
		
		new HtmlWebpackPlugin({
			title: 'MNIST Test',
			filename: '../index.html',
			template: './html/index.html',
			inject: false,
			minify: false,
			appBundle: 'app.bundle.js.gz'
		}),
	]
	
});