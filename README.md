## 安装
yarn 或者 npm install

## 运行
yarn dev 或者 npm run dev

## 旧的angular+gulp项目 改webpack 引入 react 逐步蚕食 原项目
主要解析loader ngFormatPlugin.js
html解析loader ngHTMLLoader.js
ng-annotate-loader 的中转loader ngAnnotateTransfer.js

## 主要技术
原项目 angular + angular-ui-bootstrap + angular-ui-router + gulp

后 react + antd + typescript + react-intl(放弃了redux。而是多用的hooks，hooks玩的不要太爽)
只是逐步蚕食，对于人力不够时很不错的一个办法

## 封装组件（提醒自己得空写单元测试，发布npm）
###### Ant Design的 select组件封装 Dropdown组件封装
* 方便项目使用，参见src/AntdSelect.tsx, src/AntdDropdown.tsx
###### 自定义事件封装
* 主要是想整一个防止重复监听的事件监听，参见src/events.ts
###### http请求缓存
* 主要是防止原项目中的一些同时的重复请求问题
* 原先老项目历史悠久，多个人操作过，有一些地方存在重复请求
* 同时也做了请求缓存，可自定义缓存字段唯一值，也可以不给（会以参数作为缓存唯一值）
* 参见 src/syncCache.ts
###### 提示工具的封装
* <https://github.com/tiandao5d/xlToast>
* npm 中搜索 xxl-toast