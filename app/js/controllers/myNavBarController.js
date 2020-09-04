let { RelTestView } = require("src/relCom");
let { reactElCls } = require("src/reactToNg");
let { reactLangCls } = require("src/intl");
var MyNavbarController = function ($rootScope, $scope, $state, AppSettings) {
  "ngInject";

  $scope.lang = reactLangCls.lang;
  $scope.title = "抬头的内容";
  reactElCls.add({
    component: RelTestView,
    id: "rel_nav_item",
    el: ".rel_nav_item",
  });
  $scope.langToggle = function () {
    reactLangCls.toggle();
    $scope.lang = reactLangCls.lang;
    $rootScope.lang = reactLangCls.lang;
  };
};

module.exports.fn = MyNavbarController;
module.exports.name = "MyNavbarController";
