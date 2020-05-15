// Webpack config that helps with bundling AWS Lambda
// and its dependencies into single, smaller chunks of JS files
const path = require('path');
const fs = require('fs');

const dir = path.resolve(__dirname, './lambdas/');
const handlers = fs.readdirSync(dir).filter(function (file) {
    // Get only .ts files (ignore .d.ts)
    return file.match(/(^.?|\.[^d]|[^.]d|[^.][^d])\.ts$/);
});


const entries = {};
handlers.forEach(handler => {
    const filenameWithoutExt = handler.replace('.ts', '');
    entries[filenameWithoutExt] = path.resolve(dir, handler);
});

if (!handlers.length) {
    throw new Error(`No files found in ${dir}`);
}

module.exports = {
    entry: entries,
    mode: 'production',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    }
                },
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        // Exclude AWS-SDK because it's already globally available in the AWS Lambda runtime
        'aws-sdk': 'aws-sdk',
        'aws-sdk/clients/dynamodb': 'aws-sdk/clients/dynamodb',
    },
    optimization: {
        minimize: false
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, './lambdas'),
        ],
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist/lambdas'),
        filename: "[name]/index.js"
    },
};
