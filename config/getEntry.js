var glob = require('glob')

exports.getEntry = function() {
  var entries = {};
  var items = glob.sync("./src/modules/*/*.js");
  for (var i in items) {
    var filepath = items[i];
    var fileList = filepath.split("/");
    var fileName = fileList[fileList.length - 2];
    entries[fileName] = {
      entry: `src/modules/${fileName}/main.js`,
      // 模板来源
      // template: `src/modules/${fileName}/main.js`,
      template: `src/modules/${fileName}/public/index.html`,
      // 在 dist/index.html 的输出
      filename: `${fileName}.html`,
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ["chunk-vendors", "chunk-common", fileName]
    };
  }
  return entries;
}
