<template>
	<div id="app">
		<div v-show="loading" id="spin">
			<a-Spin style="margin-top: 25%; margin-left: 50%" />
		</div>
		<a-layout>
			<a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
				<div>
					<span style="width: 100px; color: white; margin-right: 2rem" @click="goHome">Home</span>
					<span v-show="isConnected" style="width: 100px; color: white">{{ network }}:{{ account }}</span>
					<span v-show="!isConnected" style="width: 100px; color: white">
						<a-button type="primary" @click="connect">
							Connect
						</a-button>
					</span>
				</div>
			</a-layout-header>
			<a-layout-content :style="{ padding: '0 50px', marginTop: '64px' }">
				<div :style="{ background: '#fff', padding: '24px', minHeight: '800px' }">
					<a-input v-model="cid" />
					<a-input v-model="size" />
					<a-input v-model="expiration" />
					<!-- <keep-alive>
						<router-view style="margin-left: 8px" />
					</keep-alive> -->
					<div style="display: inline-block">
						<a-button type="primary" @click="approve">
							approve
						</a-button>
						<a-button type="primary" @click="insert">
							insert cid
						</a-button>
						<a-button type="primary" @click="renew">
							renew cid
						</a-button>
						<a-button type="primary" @click="expand">
							expand cid
						</a-button>
					</div>
				</div>
			</a-layout-content>
		</a-layout>
	</div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Core } from '@/web3modal/core'
import { UPDATE_ACCOUNT, UPDATE_CHAINID } from '@/store'
import { uint256Max } from './utils/index'
import { providers } from 'ethers'
import WalletconnectProvider from '@walletconnect/web3-provider'
import contracts from '@/contracts'

@Component
export default class App extends Vue {
	core!: Core
	cid = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'
	size = 119762
	expiration = 10000

	async created() {
		this.core = new Core({
			cacheProvider: true,
			providerOptions: {
				metamask: { package: '', display: { name: 'Metamask' } },
				walletconnect: {
					package: WalletconnectProvider,
					display: { name: 'WalletConnect' },
					options: { infuraId: 'f4c7dab173b4418ba4838ffadc3bd904' },
				},
			},
		})
		this.core.on('connect', async (p) => {
			p.on('networkChanged', () => {
				window.location.reload()
			})
			p.on('accountsChanged', () => {
				window.location.reload()
			})
			const provider = new providers.Web3Provider(p)
			const network = await provider.getNetwork()
			const chainId = network.chainId
			console.log('chainId', chainId)
			contracts.setProvider(provider)
			const account = await contracts.signer.getAddress()
			this.$store.commit(UPDATE_ACCOUNT, account)
			this.$store.commit(UPDATE_CHAINID, chainId)
		})
		this.core.on('close', (err) => {
			this.popError(err)
		})
		this.core.on('error', (err) => {
			this.popError(err)
		})
		if (!this.core.cachedProvider) {
			await this.connect()
		} else {
			await this.core.connect()
		}
	}

	get network() {
		const chainId = this.$store.state.chainId
		if (chainId == 1) {
			return 'Ethereum Mainnet'
		} else if (chainId == 4) {
			return 'Rinkeby'
		} else if (chainId == 5) {
			return 'Goerli'
		} else if (chainId == 97) {
			return 'Chapel'
		} else if (chainId == 56) {
			return 'BSC'
		} else if (chainId == 80001) {
			return 'Mumbai'
		} else if (chainId == 137) {
			return 'Polygon'
		} else {
			return 'Unknown'
		}
	}

	get isConnected() {
		return !!this.$store.state.account
	}

	get account() {
		return (
			this.$store.state.account.substr(0, 10) +
			'....' +
			this.$store.state.account.substr(this.$store.state.account.length - 8, 8)
		)
	}

	async connect() {
		await this.core.toggleModal()
	}

	async approve() {
		const tx = await contracts.StableCoin.approve(contracts.ContentIDRegistry.address, uint256Max)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log(receipt)
	}

	async insert() {
		const tx = await contracts.ContentIDRegistry.insert(
			contracts.StableCoin.address, 
			this.cid, 
			this.size, 
			this.expiration
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log('receipt', receipt)
	}

	async renew() {
		const tx = await contracts.ContentIDRegistry.renew(
			contracts.StableCoin.address, 
			this.cid, 
			this.expiration
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log('receipt', receipt)
	}

	async expand() {
		const tx = await contracts.ContentIDRegistry.expand(
			contracts.StableCoin.address, 
			this.cid, 
			this.size
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log('receipt', receipt)
	}

	goHome() {
		this.$router.push({
			path: '/',
		})
		this.$store.commit(UPDATE_ACCOUNT, this.$store.state.account)
	}

	get loading() {
		return this.$store.state.loading
	}
}
</script>
<style>
#spin {
	display: block;
	position: fixed;
	z-index: 999999;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: rgba(255, 255, 255, 0.6);
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
}
#components-layout-demo-fixed .logo {
	width: 120px;
	height: 31px;
	background: rgba(255, 255, 255, 0.2);
	margin: 16px 24px 16px 0;
	float: left;
}
.site-layout .site-layout-background {
	background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
	background: #141414;
}
</style>
