
## me-image-crop组件
问题交流，邮箱:369457642@qq.com

在线演示地址：手机，pc浏览器访问(http://47.110.129.207/vue-components/me-smart-ui/)

![输入图片说明](http://47.110.129.207/images/1234567.jpg)
![输入图片说明](http://47.110.129.207/images/1234567.png)

## 安装

```bash
$ npm install --save me-smart-ui

```
## 使用

```js
全量使用
import MeSmartUi from "me-smart-ui";
import 'me-smart-ui/lib/css/index.css';
Vue.use(MeSmartUi )

按需使用
import meImageCrop from "me-smart-ui/meImageCrop";
import 'me-smart-ui/lib/css/meImageCrop.css';
Vue.use(meImageCrop)
```

```html
<template>
  <me-image-crop></me-image-crop>
</template>
 ```


## DMEO
仓库地址：https://gitee.com/superzay/me-smart-ui
源码目录下有插件使用的完整demo。路径：/src/package/components/me-image-crop/demo/index.vue



## 补充说明
 组件使用canvas对图片进行缩放和裁剪，可使用单指拖动图片、鼠标拖动图片、滚轮缩放图片，双指缩放图片、鼠标单击步进旋转图片、鼠标长按连续旋转图片、双指旋转图片


## API

### Attributes
| 参数   |  说明  |  类型 |   可选值 |默认值 |
|--------|:-------:|:------:|:------:|:------:|
| image-src|  图片的DataURL（由于canvas跨域污染问题，只支持图片的base64编码数据） | string|------ |------|
| show-btn| 是否显示裁剪和取消按钮  | Boolean | true / false |  true|
| out-type| 输出图片的格式  | string| base64/blob |  base64|




### Methods
| 方法名   |  说明  | 参数 |
|--------|:-------:|:------:|
| getImage | 返回裁剪后的图片|获取base64格式图片不需要参数。获取blob格式图片，需要传递回调函数，回调函数会接收到blob对象，注意该过程为异步|



### Event
| 事件名   |  说明  | 参数 | 返回值 |
|--------|:-------:|:------:|:------:|
| cancel-crop-image| 取消图片参加 |------|------|
| confirm-crop-image| 确认裁剪图片 |------|返回裁剪后的图片，格式base64|



### Slot
| 插槽名称   |  说明  |
|--------|:-------:|
| rotate| pc端图片旋转按钮插槽 |
| cancel| 取消裁剪按钮插槽 |
| confirm| 确认裁剪按钮插槽 |


## 运行
克隆项目到本地，执行npm install安装依赖，然后运行npm run dev即可查看
