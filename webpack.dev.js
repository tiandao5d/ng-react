const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { env } = require("./web_api_config.js"); // 项目配置文件的获取方法，根据webpack提供的env环境变量进行匹配
module.exports = merge(common, {
  mode: "development", // development  production
  devServer: {
    contentBase: "./dist",
    hot: true,
    port: 9000,
    host: "0.0.0.0",
    noInfo: true,
    open: true,
  },
  module: {
    rules: [
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.less$/, use: ["style-loader", "css-loader", "less-loader"] },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  watchOptions: {
    ignored: [/ngPluginConfig.js/, /node_modules/],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: "app/index.html",
      env,
      favicon: path.resolve(__dirname, "app/images/favicon.ico"),
    }),
  ],
});
