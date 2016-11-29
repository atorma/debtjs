var merge = require('webpack-merge');
var validate = require('webpack-validator');
var configParts = require('./webpack.config.parts');

var webpackConfig = merge.smartStrategy({plugins: 'replace'})(
    configParts.setupCommon(),
    {
        entry: {},
        plugins: [],
        output: {},
        module: {
            loaders: [
                {
                    test: /\.css$/,
                    loader: 'ignore'
                },
                {
                    test: /\.(eot|ttf|woff|woff2)$/,
                    loader: 'ignore'
                },
                {
                    test: /\.(png|svg)$/,
                    loader: 'ignore'
                }
            ]
        }
    }
);

// You can set this environment variable in IntelliJ run configuration
if (process.env.debug) {
    webpackConfig = merge(
        webpackConfig,
        {
            devtool: 'inline-source-map'
        }
    );
}

module.exports = validate(webpackConfig, {
    quiet: true
});