const path = require('path'); //引入path模块
module.exports = {
	lintOnSave: false,
	chainWebpack: (config) => {
		config.resolve.alias.set('@', path.resolve(__dirname, './src'));
		// 移除 prefetch 插件
		config.plugins.delete('prefetch');
		config.plugins.delete('preload');
	},
	transpileDependencies: ["me-image-crop", 'vue', 'router', 'vuex'],
	
}