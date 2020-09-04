var nglang = function ($rootScope) {
  "ngInject";

  return function (cn, en, language = $rootScope.language, special) {
    if (special === false) {
      if (language === "zh-CN") {
        return cn;
      }
      return en;
    }
    if (special) {
      if (language != "zh-CN" && language != "en-US") {
        return special || en || cn;
      }
      return en || special || cn;
    }
    if (language === "zh-CN") {
      return cn || en;
    }
    return en || cn;
  };
};

module.exports.name = "nglang";
module.exports.fn = nglang;
