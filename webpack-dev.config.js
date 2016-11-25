'use strict';

var makeWebpackConfig = require('./webpack.config.factory.js');

module.exports = makeWebpackConfig({
    devtool: 'eval',
    debug: true,
    devServer: {
        inline: true
    }
});