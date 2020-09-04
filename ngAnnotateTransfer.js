// ng-annotate-loader 的中转
let nal = require("ng-annotate-loader");
module.exports = function (source, inputSourceMap) {
  if (/('|")ngInject('|")/.test(source)) {
    nal.bind(this)(source, inputSourceMap);
  } else {
    this.callback(null, source, inputSourceMap);
  }
};
