import imageCrop from './components/image-crop';

let components=[imageCrop];

export default {
	install(Vue){
		components.forEach((item)=>{
			Vue.component(item.name,item)
		})
	}
}
