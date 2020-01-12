const path = require('path'); //引入path模块
module.exports = {
	lintOnSave: false,
	chainWebpack: (config) => {
		config.resolve.alias.set('@', path.resolve(__dirname, './src'))
	}，
transpileDependencies: ["me-image-crop",'vue','router','vuex']
}