const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    entry: { shell: './out/shell/main.js', background: './out/background/main.js' },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'out/webpack'),
    },
    devtool: 'source-map',
    module: {
        noParse: /sql\.js/,
        rules: [
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre",
                exclude: /node_modules/
            },
            // {
            //     test: /\.css$/i,
            //     use: [{ loader: 'to-string-loader' }, {
            //         loader: 'css-loader',
            //     }],
            // },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        modules: ['./node_modules'],
        extensions: ['.js', '.html'],
        alias: {
            resource: path.resolve('./src/shell'), // require('resource/xxx.html')
        }
    },
    mode: 'development',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'resource', to: 'resource' },
                { from: 'manifest.json' },
                { from: 'rules.json' },
                { from: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js' },
                { from: '../fast-ui/dist/fast-ui', to: '' },
            ]
        })
    ]
};