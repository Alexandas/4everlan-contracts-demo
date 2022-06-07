import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import Antd from 'ant-design-vue'
import { message } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import '@/style/index.css'
import mixin from '@/mixins'
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.mixin(mixin)
Vue.use(VueAxios, axios)
Vue.use(Antd)
Vue.prototype.$message = message
Vue.config.productionTip = false

new Vue({
	store,
	router,
	render: (h) => h(App),
}).$mount('#app')
