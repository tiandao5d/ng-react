// webpack执行之前处理 angular 的 文件
const path = require("path");
const fs = require("fs");
const NgFormatPlugin = require("./ngFormatPlugin.js"); // 提前将views，filters等文件夹下的文件合为一体，然后当成入口文件开始执行打包
const { apiSetting, env, isBuild } = require("./web_api_config.js"); // 项目配置文件的获取方法，根据webpack提供的env环境变量进行匹配
let pluginFiltertoDir = "./app/ng_plugin";
let ngPluginArr = [
  new NgFormatPlugin({
    filesrc: path.resolve(pluginFiltertoDir, "./ngPluginControllers.js"),
    dirsrc: path.resolve("./app/js/controllers"),
    moduleStr: "app.controllers",
    ngKey: "controller",
    exclude: ["ngLoader.js", "index.js"],
  }),
  new NgFormatPlugin({
    filesrc: path.resolve(pluginFiltertoDir, "./ngPluginDirectives.js"),
    dirsrc: path.resolve("./app/js/directives"),
    moduleStr: "app.directives",
    ngKey: "directive",
    exclude: ["ngLoader.js", "index.js"],
  }),
  new NgFormatPlugin({
    filesrc: path.resolve(pluginFiltertoDir, "./ngPluginFilters.js"),
    dirsrc: path.resolve("./app/js/filters"),
    moduleStr: "app.filters",
    ngKey: "filter",
    exclude: ["ngLoader.js", "index.js"],
  }),
  new NgFormatPlugin({
    filesrc: path.resolve(pluginFiltertoDir, "./ngPluginServices.js"),
    dirsrc: path.resolve("./app/js/services"),
    moduleStr: "app.services",
    ngKey: "service",
    exclude: ["ngLoader.js", "index.js"],
  }),
  new NgFormatPlugin({
    filesrc: path.resolve(pluginFiltertoDir, "./ngPluginUtils.js"),
    dirsrc: path.resolve("./app/js/utils"),
    moduleStr: "app.utils",
    ngKey: "service",
    exclude: ["ngLoader.js", "index.js"],
  }),
  new NgFormatPlugin({
    filesrc: path.resolve(pluginFiltertoDir, "./ngPluginViews.js"),
    dirsrc: path.resolve("./app/views"),
    moduleStr: "templates",
    type: "view",
  }),
  new NgFormatPlugin({
    filesrc: path.resolve(pluginFiltertoDir, "./ngPluginConfig.js"),
    moduleStr: "xulin.constants",
    ngName: "AppSettings",
    settingJson: apiSetting,
    type: "api_config",
  }),
];
class Ngp {
  apply(compiler) {
    compiler.hooks.watchRun.tapAsync("Ngp", (compiler, callback) => {
      console.log("watchRun", env);
      webpackBeforeRun();
      callback();
    });
    compiler.hooks.beforeRun.tapAsync("Ngp", (compiler, callback) => {
      console.log("beforeRun", env);
      webpackBeforeRun();
      callback();
    });
  }
}
function webpackBeforeRun() {
  ngPluginArr.forEach((o) => {
    o.reset();
  });
}
module.exports = { Ngp };
