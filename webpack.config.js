const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WorkerPlugin = require('worker-plugin');

module.exports = {

  entry: {
    main: "./src/app.js",
    updater: "./src/updater.js",
  },
	output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
	},

	module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          options: {
            inline: false, 
            fallback: false
          }
        }
      },

      {
        test: [/.js$/],
        exclude: [/node_modules/],
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", {modules: false}],
              // "@babel/typescript"
            ],
        
            plugins: [
              
              "@babel/plugin-transform-regenerator", 
              "@babel/plugin-transform-async-to-generator",
              "@babel/plugin-transform-arrow-functions", 
              "@babel/plugin-transform-spread", 
              "@babel/plugin-transform-template-literals", 
              "@babel/plugin-transform-shorthand-properties", 
              "@babel/plugin-transform-destructuring", 
              "@babel/plugin-transform-block-scoping", 
              "@babel/plugin-proposal-object-rest-spread",

            ]
          }
        }
      },
      
    ]
  },
  // resolve: {extensions: [".js"]},
  plugins: [
    // new WorkerPlugin({globalObject: "self"}),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
      inject: false,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      }
    }),
    new HtmlWebpackPlugin({
      filename: "signin.html",
      template: "./src/signin.html",
      inject: false,
      chunks: ["signin"],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      }
    }),
    new CopyWebpackPlugin([{from: "./src/assets", to: "assets"}])
  ]
}