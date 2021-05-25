// 获取执行module名
const moduleName = process.argv[3].split('=')[1];
const CopyWebpackPlugin = require('copy-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production'
//去除console
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')
const resolve = dir => path.join(__dirname, dir)

if(!moduleName) {
  console.error('请输入模块名')
  process.exit()
}

const cdn = {
  externals: {
    'vue': 'Vue',
    'vuex': 'Vuex',
    'vue-router': 'VueRouter',
    'axios': 'axios',
    "element-ui": "ELEMENT",
  },
  css: [
    'https://lib.baomitu.com/element-ui/2.13.2/theme-chalk/index.css'
  ],
  js: [
    'https://cdn.bootcss.com/vue/2.6.10/vue.min.js',
    'https://cdn.bootcss.com/vue-router/3.1.3/vue-router.min.js',
    'https://cdn.bootcss.com/vuex/3.1.2/vuex.min.js',
    'https://lib.baomitu.com/element-ui/2.13.2/index.js',
    'https://cdn.bootcss.com/axios/0.19.2/axios.min.js'
  ]
}

module.exports = {
  publicPath: "./", // 官方要求修改路径在这里做更改，默认是根目录下，可以自行配置
  outputDir: "dist", //标识是打包哪个文件
  //默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存。如果你无法使用 Vue CLI 生成的 index HTML，你可以通过将这个选项设为 false 来关闭文件名哈希。
  filenameHashing: true,
  //pages 里配置的路径和文件名在你的文档目录必须存在 否则启动服务会报错
  pages: {
    index: {
      entry: "src/modules/" + moduleName + "/main.js",
      template: "src/modules/" + moduleName + "/public/index.html",
      // 在 dist/index.html 的输出
      filename: "index.html",
      title: moduleName,
      // chunks: ["chunk-vendors", "chunk-common", moduleName]
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
  configureWebpack: config => {
    // 配置解析别名
    config.resolve = {
      extensions: ['.js', '.json', '.vue'],
      alias: {
        '@': resolve('src'),
        '@comp': resolve('./src/components'),
        "@css": resolve('./src/styles'),
        "@assets": resolve('./src/assets'),
      }
    }
    if (isProduction) {
      // 不打包这些资源
      // config.externals = cdn.externals
      config.mode = 'production'
      //  生产环境删除console
      config.plugins.push(
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log'] // 移除console
            }
          }
        })
      )
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: __dirname + '/src/modules/' + moduleName + '/public',
              to: __dirname + '/dist/',
              globOptions: {
                dot: true,
                gitignore: true,
                ignore: ['index.html'],
              },
            }
          ]
        })
      )
      //     // config.plugins.push(new BundleAnalyzerPlugin()) // 是否查看构建后的信息
    }
  },
  chainWebpack: (config) => {

    // // preload 预加载
    // config.plugin('preload').tap(() => [
    //   {
    //     rel: 'preload',
    //     // to ignore runtime.js
    //     fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
    //     include: 'initial'
    //   }
    // ])
    // // when there are many pages, it will cause too many meaningless requests
    // config.plugins.delete('prefetch')

    if (isProduction) {
      // 压缩代码
      config.optimization.minimize(true)

      //  cdn
      // config.plugin('html')
      //     .tap(args => {
      //       args[0].cdn = cdn;
      //       return args;
      //     })

      //gzip压缩
      // config.plugin('compression-webpack-plugin')
      //     .use(new CompressionPlugin({
      //         filename: '[path].gz[query]',
      //         algorithm: 'gzip',
      //         test: /.(html|js|css|map|woff|ttf|eot)$/,
      //         //压缩超过此大小的文件,以字节为单位
      //         threshold: 1024,
      //         minRatio: 0.8,
      //         //删除原始文件只保留压缩后的文件
      //         // deleteOriginalAssets: isProduction
      //     }))

      // 公共代码抽离
      config
        .optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          },
          vendor: {
            chunks: 'all',
            // test: /node_modules/,
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            minChunks: 1,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 100
          },
          components: {
            name: 'chunk-components',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum components number
            priority: 5,
            reuseExistingChunk: true
          },
          common: {
            chunks: 'all',
            test: /[\\/]src[\\/]js[\\/]/,
            name: 'common',
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 60
          },
          styles: {
            name: 'styles',
            test: /\.(le|sa|sc|c)ss$/,
            chunks: 'all',
            reuseExistingChunk: true,
            minChunks: 1,
            enforce: true
          }
        }
      })

      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [{
          // `runtime` must same as runtimeChunk name. default is `runtime`
          inline: /runtime\..*\.js$/
        }])
        .end()

      //  name: entrypoint => `manifest.${entrypoint.name}`
      // config.optimization.runtimeChunk('multiple')//将 optimization.runtimeChunk 设置为 true 或 "multiple"，会为每个仅含有 runtime 的入口起点添加一个额外 chunk。此设置是如下设置的别名：
      // runtimeChunk: {
      //       name: entrypoint => `runtime~${entrypoint.name}`
      //     }

      config.optimization.runtimeChunk('single')//值 "single" 会创建一个在所有生成 chunk 之间共享的运行时文件。此设置是如下设置的别名
      //runtimeChunk: {
      //       name: 'runtime'
      //}
    }
  }
};
