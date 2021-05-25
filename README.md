
### 创建module
```
npm run create:module

//输入mudole名称后会将template文件夹拷贝至mudule下并重命名为输入的module名称
```

### module dev 运行

在package.json文件script新增一行命令
```
"serve:test1": "vue-cli-service serve --module=test1"
```

### module build 打包

在package.json文件script新增一行命令
```
"build:test1": "vue-cli-service build --module=test1"
```
