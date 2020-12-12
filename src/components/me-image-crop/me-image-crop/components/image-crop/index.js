import imageCrop from './image-crop.vue'

imageCrop.install=function(Vue){
	Vue.component(imageCrop.name,imageCrop)
}

export default imageCrop