import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
Vue.use(VueRouter)

const routes: RouteConfig[] = [
	// {
	// 	path: '/',
	// 	name: 'MerchantProducts',
	// 	component: () => import('../views/MerchantProducts.vue'),
	// },
	// {
	// 	path: '/product/:id',
	// 	name: 'ProductDetail',
	// 	component: () => import('../views/ProductDetail.vue'),
	// }
]

const router = new VueRouter({
	base: process.env.BASE_URL,
	routes,
})

export default router
