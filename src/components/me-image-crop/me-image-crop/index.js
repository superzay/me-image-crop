import imageCrop from './components/image-crop' 


const components = [imageCrop]


const install = function(Vue) {
	components.forEach((component) => {
		Vue.component(component.name, component)
		
	})
}

export default {
	version: '1.0.0',
	install, 
}