import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import meImageCrop from 'me-image-crop'
import 'me-image-crop/lib/css/index.css'

Vue.use(meImageCrop);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
