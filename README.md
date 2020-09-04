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

## 封装组件
一些项目中的常用组件封装