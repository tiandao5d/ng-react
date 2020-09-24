// angular 的解析器，webpack loader
const path = require("path");
const fs = require("fs");
let allFiles = {};
class NgFormatPlugin {
  constructor(options) {
    // let a = {
    //   filesrc: 'src/js/services/ngLoader.js', // 处理后放在哪个文件中，会自动创建文件
    //   dirsrc: 'src/js/services', // 模块内容所在文件夹
    //   moduleStr: 'app.services', // 给这个模块命名
    //   ngKey: 'service', // 需要创建模块的属性名称，可以使service，controller，filter等
    //   exclude: ['ngLoader.js', 'index.js'], // 需要排除在外的文件名
    //   type: '' // 默认为空，可以是view就是对angularjs缓存页面
    // }
    this.filesrc = options.filesrc; // 数据存放的文件
    this.moduleStr = options.moduleStr; // angular模块名称
    this.ngKey = options.ngKey; // 用于告诉是一个service，还是ctrl，记录在angular中
    // 以上三个参数必填

    this.dirsrc = options.dirsrc || path.parse(this.filesrc).dir; // 数据来源文件夹，不给则是数据存放文件所在的文件夹
    this.exclude = options.exclude; // 需要排除在外的文件
    this.type = options.type; // 判断处理的方式，view或者空

    this.options = options;
  }
  reset() {
    // 都需要判断文件是否有改变，或内容是否有改变，才会去更新否则不予处理
    // 这样才不会出现死循环
    let fstr = "";
    if (this.type === "view") {
      fstr = this.formatNgView();
    } else if (this.type === "api_config") {
      this.apiConfigStr();
      return false;
    } else {
      fstr = this.formatNg();
    }
    if (fstr) {
      try {
        fs.writeFileSync(this.filesrc, fstr, { flag: "w+" });
      } catch (err) {
        fs.mkdirSync(path.parse(this.filesrc).dir);
        fs.writeFileSync(this.filesrc, fstr, { flag: "w+" });
      }
    }
  }
  // nodejs 遍历文件夹
  // const fs = require('fs');
  // const path = require('path');
  eachDir(dirstr) {
    let arr = [];
    aa(dirstr);
    function aa(dirs) {
      let list = fs.readdirSync(dirs);
      list.forEach((s) => {
        s = path.join(dirs, s);
        let stat = fs.statSync(s);
        if (stat.isDirectory()) {
          // 文件夹
          aa(s);
        } else {
          arr.push(s);
        }
      });
    }
    return arr;
  }
  hasNewFile(arr) {
    // 是否有新的文件
    let oldFiles = allFiles[this.filesrc] || [];
    if (arr.length === oldFiles.length) {
      return arr.some((s) => !oldFiles.includes(s));
    }
    return true;
  }

  apiConfigStr() {
    let that = this;
    let settingJson = this.options.settingJson || ""; // 配置angular的api接口地址
    let ngName = this.options.ngName || ""; // 配置angular的api接口地址
    settingJson =
      typeof settingJson === "string"
        ? settingJson
        : JSON.stringify(settingJson);
    let oldStr = allFiles[this.filesrc] || "";
    let newStr = `import angular from 'angular';\nexport default angular.module("${that.moduleStr}", []).constant("${ngName}", ${settingJson});`;
    if (oldStr === newStr) {
      return false;
    }
    allFiles[this.filesrc] = newStr;
    try {
      fs.writeFileSync(that.filesrc, newStr, { flag: "w+" });
    } catch (err) {
      fs.mkdirSync(path.parse(this.filesrc).dir);
      fs.writeFileSync(that.filesrc, newStr, { flag: "w+" });
    }
  }

  // html模板缓存解析
  formatNgView() {
    let that = this;
    let arr = that.eachDir(that.dirsrc);
    arr = arr.filter((s) => /\.html$/.test(s));
    if (that.exclude && that.exclude.length) {
      arr = arr.filter((s) => !that.exclude.some((ss) => s.includes(ss)));
    }
    if (!that.hasNewFile(arr)) {
      return false;
    }
    allFiles[that.filesrc] = arr;
    return that.viewStr();
  }
  viewStr() {
    let oldFiles = allFiles[this.filesrc] || [];
    let that = this;
    let names = [];
    let relative = path.relative(path.parse(that.filesrc).dir, that.dirsrc);
    let str = oldFiles
      .map((s) => {
        names.push(path.parse(s).base);
        return `require('${path.join(relative, s.replace(that.dirsrc, ""))}')`;
      })
      .join(",\n");
    return `let angular = require('angular');
let [...pall] = [
${str}
];
let pallNames = ${JSON.stringify(names)};
const aModule = angular.module('${
      that.moduleStr
    }', []).run(['$templateCache', function($templateCache) {
  pall.forEach((s, i) => {
    $templateCache.put(pallNames[i], s)
  })
}]);
module.exports = aModule;
    `;
  }
  // 其他的filter，service等解析
  formatNg() {
    let that = this;
    let arr = that.eachDir(that.dirsrc);
    arr = arr.filter((s) => /\.js$/.test(s));
    if (that.exclude && that.exclude.length) {
      arr = arr.filter((s) => !that.exclude.some((ss) => s.includes(ss)));
    }
    if (!that.hasNewFile(arr)) {
      return false;
    }
    allFiles[that.filesrc] = arr;
    return that.otherStr();
  }
  otherStr() {
    let oldFiles = allFiles[this.filesrc] || [];
    let that = this;
    let relative = path.relative(path.parse(that.filesrc).dir, that.dirsrc);
    let str = oldFiles
      .map((s) => {
        return `require('${path.join(relative, s.replace(that.dirsrc, ""))}')`;
      })
      .join(",\n");
    return `let angular = require('angular');
const aModule = angular.module('${that.moduleStr}', []);
let [...pall] = [
${str}
];
pall.forEach(item => {
  if (item.fn && typeof item.fn === 'function') {
    aModule['${that.ngKey}'](item.name, item.fn);
  }
});
module.exports = aModule;
  `;
  }
}

module.exports = NgFormatPlugin;
