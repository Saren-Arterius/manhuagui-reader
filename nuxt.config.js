const webpack = require('webpack');

module.exports = {
  mode: 'spa',
  head: {
    title: 'manhuagui-reader',
    link: [
      {rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons'}
    ]
  }, // Headers of the page
  loading: false, // Disable default loading bar
  build: {
    vendor: ['babel-polyfill', 'jquery', '~/assets/js/materialize.js'],
    plugins: [
      // set shortcuts as global for bootstrap
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      })
    ],
    extend (config, {
      isDev,
      isClient
    }) {
      if (isDev && isClient) {
        // Run ESLint on save
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|assets)/
        });
      }
      // Extend only webpack config for client-bundle
      if (isClient) {
        config.target = 'electron-renderer';
      }
    }
  },
  dev: process.env.NODE_ENV === 'DEV',
  css: [
    '@/assets/css/materialize.css'
  ],
  plugins: [{
    src: '~/plugins/nuxt-client-init.js',
    ssr: false
  }]
};
