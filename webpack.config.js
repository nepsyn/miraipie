const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './lib/miraipie.js',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'miraipie.bundle.js',
        library: 'Miraipie',
        libraryTarget: 'umd'
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(
            /^ws$/,
            path.join(__dirname, 'src/browser/ws.mock.js')
        ),
        new webpack.NormalModuleReplacementPlugin(
            /^log4js$/,
            path.join(__dirname, 'src/browser/log4js.mock.js')
        ),
        new webpack.NormalModuleReplacementPlugin(
            /^fs-extra$/,
            path.join(__dirname, 'src/browser/fs-extra.mock.js')
        ),
        new webpack.DefinePlugin({
            'process.env': {}
        })
    ],
    mode: 'production',
    node: {
        path: true,
        Buffer: true
    }
};
