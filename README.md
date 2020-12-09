
## me-image-crop组件


在线演示地址：手机，pc浏览器访问(http://47.110.129.207/vue-compoens/me-image-crop/)

![输入图片说明](https://images.gitee.com/uploads/images/2019/1207/215805_db3bc299_1844723.jpeg "1575726795(1)_meitu_1.jpg")
![输入图片说明](http://47.110.129.207/images/1234567.png)

## 安装

```bash
$ npm install --save me-image-crop

```
## 使用

```js
import meImageCrop from "me-image-crop";
import 'me-image-crop/lib/css/index.css';
Vue.use(meImageCrop )
```
```html
<template>
  <me-image-crop></me-image-crop>
</template>
 ```
## CDN
 项目的cdn目录下，有使用script标签引用me-image-crop插件，进行快速开发的demo

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


## 运行
克隆项目到本地，执行npm install安装依赖，然后运行npm run serve即可查看




