// html模板引入编译

module.exports = function (source, inputSourceMap) {
  let arr = [];
  source = source
    .replace(/images\/[^\.]+\.png/g, (s) => {
      let t = "img" + (arr.length + 1);
      arr.push(`var ${t} = require('${s}')`);
      return "${" + t + "}";
    })
    .replace("`", "\\`");
  source = `${arr.join(";")};module.exports = \`${source}\``;
  this.callback(null, source, inputSourceMap);
};
