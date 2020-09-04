// 公用的webpack配置文件
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const NgFormatPlugin = require("./ngFormatPlugin.js"); // 提前将views，filters等文件夹下的文件合为一体，然后当成入口文件开始执行打包
module.exports = {
  entry: {
    main: "./app/js/main.js",
    views: "./app/ng_plugin/ngPluginViews.js",
    filters: "./app/ng_plugin/ngPluginFilters.js",
    controllers: "./app/ng_plugin/ngPluginControllers.js",
    services: "./app/ng_plugin/ngPluginServices.js",
    directives: "./app/ng_plugin/ngPluginDirectives.js",
    utils: "./app/ng_plugin/ngPluginUtils.js",
  },
  output: {
    filename: "./js/[name].builde.[hash:6].js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1000,
              outputPath: "images",
              name: "[name].[hash:7].[ext]",
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1000,
              outputPath: "fonts",
              name: "[name].[hash:7].[ext]",
            },
          },
        ],
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "./ngAnnotateTransfer.js",
          },
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      // { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\/views\/.+\.html$/,
        exclude: /node_modules/,
        use: "./ngHTMLLoader.js",
      },
    ],
  },
  resolve: {
    alias: {
      images: path.resolve(__dirname, "app/images"),
      src: path.resolve(__dirname, "src"),
    },
    extensions: [".ts", ".tsx", ".js", ".json", ".jsx"],
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    axios: "axios",
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  plugins: [
    new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: ["dist"] }),
    new NgFormatPlugin({
      filesrc: path.resolve("./app/ng_plugin/ngPluginControllers.js"),
      dirsrc: path.resolve("./app/js/controllers"),
      moduleStr: "app.controllers",
      ngKey: "controller",
      exclude: ["ngLoader.js", "index.js"],
    }),
    new NgFormatPlugin({
      filesrc: path.resolve("./app/ng_plugin/ngPluginDirectives.js"),
      dirsrc: path.resolve("./app/js/directives"),
      moduleStr: "app.directives",
      ngKey: "directive",
      exclude: ["ngLoader.js", "index.js"],
    }),
    new NgFormatPlugin({
      filesrc: path.resolve("./app/ng_plugin/ngPluginFilters.js"),
      dirsrc: path.resolve("./app/js/filters"),
      moduleStr: "app.filters",
      ngKey: "filter",
      exclude: ["ngLoader.js", "index.js"],
    }),
    new NgFormatPlugin({
      filesrc: path.resolve("./app/ng_plugin/ngPluginServices.js"),
      dirsrc: path.resolve("./app/js/services"),
      moduleStr: "app.services",
      ngKey: "service",
      exclude: ["ngLoader.js", "index.js"],
    }),
    new NgFormatPlugin({
      filesrc: path.resolve("./app/ng_plugin/ngPluginUtils.js"),
      dirsrc: path.resolve("./app/js/utils"),
      moduleStr: "app.utils",
      ngKey: "service",
      exclude: ["ngLoader.js", "index.js"],
    }),
    new NgFormatPlugin({
      filesrc: path.resolve("./app/ng_plugin/ngPluginViews.js"),
      dirsrc: path.resolve("./app/views"),
      moduleStr: "templates",
      type: "view",
    }),
  ],
};
