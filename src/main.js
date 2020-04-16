import Vue from 'vue'
import App from './App.vue'
import router from './router'
import meImageCrop from 'me-image-crop'
import 'me-image-crop/lib/css/index.css'
//import meImageCrop from './me-image-crop'
//import './me-image-crop/lib/css/index.css'
Vue.use(meImageCrop); //使用组件库


Vue.config.productionTip = false

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')

