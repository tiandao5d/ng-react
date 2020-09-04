let angular = require("angular");
let onConfig = require("./on_config");
let onRun = require("./on_run");
require("../styles/style.scss");
// jsSku是react使用的一些全局函数库，这里引入并初始化一些数据
// 比如初始化 axios application
let ngRequire = [
  require("angular-ui-router"),
  require("angular-ui-bootstrap"),
  require("@babel/polyfill"),

  require("../ng_plugin/ngPluginConfig"), // 全局api地址配置
];
// create and bootstrap application
const requires = [
  "leap.constants",
  "ui.router",
  "templates",
  "app.filters",
  "app.controllers",
  "app.services",
  "app.directives",
  "app.utils",
  "ui.bootstrap",
];

function start() {
  window.app = angular.module("app", requires);
  window.app.config(onConfig);
  window.app.run(onRun);

  angular.bootstrap(document, ["app"], {
    strictDi: true,
  });
}

function bootstrap() {
  angular.element(document).ready(function () {
    start();
  });
}

bootstrap();
