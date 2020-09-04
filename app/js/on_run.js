let { reactToNgInit, reactElCls } = require("src/reactToNg");
let { reactLangCls } = require("src/intl");
function OnRun($rootScope, $state) {
  "ngInject";
  initBefore();
  function initBefore() {
    // 初始化一些全局需要使用的东西
    let el = document.createElement("div"); // 一个用于存放全局元素的元素容器，减少造成body的子元素污染，也方便在必要的时候一次性清空
    el.className = "body_to_div";
    $rootScope.bodyToDivEl = el;
    document.body.appendChild(el);
    reactToNgInit(); // 初始化react元素
  }

  // change page title based on state
  $rootScope.$on("$stateChangeSuccess", (event, toState) => {
    if (!($state.current.name === "project.map")) {
      // 防止突然退出登录时界面错乱，暂时没想到啥好办法
      $rootScope.bodyToDivEl.innerHTML = "";
      reactElCls.setEls([]);
    }
  });
  $rootScope.lang = reactLangCls.lang;
}

module.exports = OnRun;
