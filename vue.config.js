// 获取执行module名
const projectName = process.argv[3].split('=')[1];
// const path = require('path')
// const resolve = dir => path.join(__dirname, dir)

if(!projectName) {
  console.error('请输入模块名')
  process.exit()
}

module.exports = {
  publicPath: "./", // 官方要求修改路径在这里做更改，默认是根目录下，可以自行配置
  outputDir: "dist", //标识是打包哪个文件
  //默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存。如果你无法使用 Vue CLI 生成的 index HTML，你可以通过将这个选项设为 false 来关闭文件名哈希。
  filenameHashing: true,
  //pages 里配置的路径和文件名在你的文档目录必须存在 否则启动服务会报错
  pages: {
    index: {
      entry: "src/modules/" + projectName + "/main.js",
      template: "src/modules/" + projectName + "/public/index.html",
      // 在 dist/index.html 的输出
      filename: "index.html",
      title: projectName,
      // chunks: ["chunk-vendors", "chunk-common", projectName]
    }
  },
  productionSourceMap: false, // 生产环境 sourceMap
  devServer: {
    open: true, // 项目构建成功之后，自动弹出页面
    host: "0.0.0.0", // 主机名，也可以127.0.0.0 || 做真机测试时候0.0.0.0
    port: 8080, // 端口号，默认8080
    https: false, // 协议
    hotOnly: false, // 没啥效果，热模块，webpack已经做好了
    overlay: {
      warnings: process.env.NODE_ENV === "development",
      errors: process.env.NODE_ENV === "development",
    },
  },
};
