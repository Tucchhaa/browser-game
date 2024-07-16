const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const miniCss = require('mini-css-extract-plugin');

module.exports = {
    mode: "none",
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "bundle.min.js",
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            // styles: path.resolve("./src/styles"),
            // components: path.resolve("./src/components"),
            // core: path.resolve('./src/core'),
            // utils: path.resolve('./src/utils'),
        },
    },
    // TODO: disable when production build is enabled
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            },
            {
                test: /\.scss$/i,
                use: [
                    miniCss.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    devServer: {
        historyApiFallback: true,
        static: [
            {
                directory: path.resolve(__dirname, 'playground'),
                watch: true,
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            verbose: true,
        }),
    ],
};
