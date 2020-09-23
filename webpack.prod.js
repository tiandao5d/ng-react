const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { env } = require("./web_api_config.js"); // 项目配置文件的获取方法，根据webpack提供的env环境变量进行匹配
module.exports = merge(common, {
  mode: "production", // development  production
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              publicPath: "../",
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              publicPath: "../",
            },
          },
          "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
              publicPath: "../",
            },
          },
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  stats: "errors-only",
  plugins: [
    new HtmlWebpackPlugin({
      template: "app/index.html",
      env,
      minify: { collapseWhitespace: true },
      favicon: path.resolve(__dirname, "app/images/favicon.ico"),
      baseprod: true,
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].[hash:8].css",
    }),
    new OptimizeCssAssetsPlugin(),
  ],
});
