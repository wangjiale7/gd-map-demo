const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = '网格化智能营销平台'
      return args
    })
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
}
