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
					<div style="display: inline-block">
						<a-button type="primary" @click="providerSetPrice">
							Provider Set Price
						</a-button>
						<a-button type="primary" @click="registerAccount">
							Register Account
						</a-button>
						<a-button type="primary" @click="initWallet">
							Init Wallet
						</a-button>
						<a-button type="primary" @click="paySrcChain">
							Pay from src chain
						</a-button>
						<a-button type="primary" @click="payDstChain">
							Pay from dst chain
						</a-button>
						<a-button type="primary" @click="approveSrcChain">
							Approve src chain payment
						</a-button>
						<!-- <a-button
							type="primary"
							@click="callSGN"
						>
							Call SGN
						</a-button> -->
						<!-- <a-button
							type="primary"
							@click="safeSign"
						>
							SafeSign
						</a-button> -->
						<a-button type="primary" @click="approveDstChain">
							Approve dst chain payment
						</a-button>
						<a-button type="primary" @click="approveFundPool">
							Approve FundPool
						</a-button>
						<a-button type="primary" @click="recharge">
							Recharge
						</a-button>
						<a-button type="primary" @click="bill">
							SpendBill
						</a-button>
						<a-button type="primary" @click="withdraw">
							Withdraw
						</a-button>
					</div>
				</div>
			</a-layout-header>
			<a-layout-content :style="{ padding: '0 50px', marginTop: '64px' }">
				<div :style="{ background: '#fff', padding: '24px', minHeight: '800px' }">
					<keep-alive>
						<router-view style="margin-left: 8px" />
					</keep-alive>
				</div>
			</a-layout-content>
		</a-layout>
	</div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Core } from '@/web3modal/core'
import { UPDATE_ACCOUNT, UPDATE_CHAINID } from '@/store'
import { BigNumber, providers, utils } from 'ethers'
import { uint256Max } from './utils/index'
import WalletconnectProvider from '@walletconnect/web3-provider'
import srccontracts from '@/contracts/src-chain-contracts'
import dstcontracts from '@/contracts/dst-chain-contracts'
import client from '@/api/SGNClient'

enum ResourceType {
	Null,
	BuildingTime,
	Bandwidth,
	ARStorage,
	IPFSStorage,
}

@Component
export default class App extends Vue {
	core!: Core
	uuid = Buffer.alloc(32, 2)
	provider = '0xdec55a51ac7c77f505eff03bee9ddff9edb1ead6'

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
			if (chainId != 80001) {
				// mumbai
				// not dst chain
				srccontracts.setProvider(provider)
				const account = await srccontracts.signer.getAddress()
				this.$store.commit(UPDATE_ACCOUNT, account)
			} else {
				console.log('chain', chainId)
				dstcontracts.setProvider(provider)
				const account = await dstcontracts.signer.getAddress()
				this.$store.commit(UPDATE_ACCOUNT, account)
			}
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

	async providerSetPrice() {
		const adaptor = dstcontracts.ResourcePriceAdaptor
		const oneGB = 1 << 30
		const oneU = BigNumber.from(1e18.toString())
		const BuildingTimePrice = oneU.mul(32).div(100).div(60 * 100)
		const BandwidthPrice = oneU.mul(126).div(10).div(100 * oneGB)
		const ARPrice = oneU.mul(10).div(oneGB)
		const IPFSPrice = oneU.mul(12).div(100 * oneGB).div(30 * 24 * 3600)
		console.log(
			BuildingTimePrice.toString(),
			BandwidthPrice.toString(),
			ARPrice.toString(),
			IPFSPrice.toString()
		)
		const tx = await adaptor.setPriceAdaptors(
			[
				{
					resourceType: 1,
					price: BuildingTimePrice
				},
				{
					resourceType: 2,
					price: BandwidthPrice
				},
				{
					resourceType: 3,
					price: ARPrice
				},
				{
					resourceType: 4,
					price: IPFSPrice
				}
			]
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log('receipt', receipt)
	}

	async registerAccount() {
		const from = this.$store.state.account
		if (!from) {
			return
		}
		const oneGB = 1 << 30
		const payloads = [
			{
				resourceType: 1,
				amounts: [12000],
			},
			{
				resourceType: 2,
				amounts: [oneGB],
			},
			{
				resourceType: 3,
				amounts: [oneGB],
			},
			{
				resourceType: 4,
				amounts: [oneGB, 3600],
			},
		]
		const data = dstcontracts.ProviderController.interface.encodeFunctionData(
			'registerAndDripMult',
			[[this.uuid], [payloads]]
		)
		console.log('data', data)
		// const isProvider = await dstcontracts.ProviderRegistry.isProvider(
		// 	this.provider
		// )
		// console.log('isProvider', isProvider)
		// const tx = await dstcontracts.ProviderController.registerAccount(
		// 	this.uuid,
		// 	Math.floor(Date.now() / 1000) + 600
		// )
		const tx = await dstcontracts.ProviderController.registerAndDripMult(
			[this.uuid],
			[payloads]
		)
		console.log('tx', tx)
	}

	

	async initWallet() {
		console.log('uuid', this.uuid.toString('hex'))
		// const from = this.$store.state.account
		// if (!from) {
		// 	return
		// }
		const from = '0x712b4DAf0Ab3761aBAdF80BAEccba92bb120252d'
		const isProvider = await dstcontracts.ProviderRegistry.isProvider(
			this.provider
		)
		console.log('isProvider', isProvider)
		const name = 'ProviderController'
		const version = 'V1'
		const chainId = await dstcontracts.signer.getChainId()
		const verifyingContract = dstcontracts.ProviderController.address
		// Wallet(address provider,bytes32 account,address wallet)
		// const walletSig = await dstcontracts.signer._signTypedData(
		// 	{
		// 		name,
		// 		version,
		// 		chainId,
		// 		verifyingContract,
		// 	},
		// 	{
		// 		Wallet: [
		// 			{ name: 'provider', type: 'address' },
		// 			{ name: 'account', type: 'bytes32' },
		// 			{ name: 'wallet', type: 'address' },
		// 		],
		// 	},
		// 	{
		// 		provider: this.provider,
		// 		account: this.uuid,
		// 		wallet: from,
		// 	}
		// )
		// console.log('walletSig', walletSig)
		const doaminTypeHash = utils.keccak256(
			Buffer.from(
				'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
			)
		)
		const domainStructHash = utils.keccak256(
			utils.defaultAbiCoder.encode(
				['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
				[
					doaminTypeHash,
					utils.keccak256(Buffer.from(name)),
					utils.keccak256(Buffer.from(version)),
					chainId,
					verifyingContract,
				]
			)
		)
		const messageTypes =
			'Wallet(address provider,bytes32 account,address wallet)'
		const messageTypeHash = utils.keccak256(Buffer.from(messageTypes))
		const messageStructHash = utils.keccak256(
			utils.defaultAbiCoder.encode(
				['bytes32', 'address', 'bytes32', 'address'],
				[messageTypeHash, this.provider, this.uuid, from]
			)
		)
		const hash = utils.keccak256(
			Buffer.concat([
				Buffer.from('1901', 'hex'),
				Buffer.from(domainStructHash.substring(2), 'hex'),
				Buffer.from(messageStructHash.substring(2), 'hex'),
			])
		)
		console.log('hash', hash)
		const cHash =
			await dstcontracts.ProviderController.hashTypedDataV4ForWallet(
				this.provider,
				this.uuid,
				from
			)
		console.log('hashTypedDataV4ForWallet', cHash)
		// const sig = walletSig
		const address = utils.recoverAddress(hash, '0x660332f24d280eb0e8170ce9f501b38a6074974c3f3770640aac987536c3a230')
		console.log('recoverAddress', address)
		// const tx = await dstcontracts.ProviderController.initWallet(
		// 	this.provider,
		// 	this.uuid,
		// 	from,
		// 	sig
		// )
		// console.log('tx', tx)
		// const receipt = await tx.wait()
		// console.log('receipt', receipt)
		// const walletExists = await dstcontracts.ProviderController.walletExists(
		// 	this.provider,
		// 	this.uuid
		// )
		// console.log('walletExists', walletExists)
		// const walletOf = await dstcontracts.ProviderController.walletOf(
		// 	this.provider,
		// 	this.uuid
		// )
		// console.log('walletOf', walletOf)
	}

	async approveSrcChain() {
		const tx = await srccontracts.GoerliUSDC.approve(
			srccontracts.SrcChainPayment.address,
			uint256Max
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log(receipt)
	}

	async approveDstChain() {
		const tx = await dstcontracts.MumbaiUSDC.approve(
			dstcontracts.DstChainPayment.address,
			uint256Max
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log(receipt)
	}

	async paySrcChain() {
		const account = this.$store.state.account
		console.log('account', account)
		const uuidRegistered = await srccontracts.ProviderController.accountExists(
			this.provider,
			this.uuid
		)
		if (!uuidRegistered) {
			throw 'account is not registered'
		}
		const oneGB = 1 << 30
		const buildingTimeAmount = 200 * 60 // 200 minutes
		const bandwidthAmount = oneGB //100 * 1024 * 1024 * 1024 //100GB
		const arStorageAmount = oneGB //1 * 1024 * 1024 // 100GB
		let ipfsStorageAmount = oneGB //100 * 1024 * 1024 * 1024 // 100GB
		let ipfsExpiration = 3600 * 7 * 24 // 3600
		const buildingTimeFee = await srccontracts.DstChainPayment.getValueOf(
			this.provider,
			ResourceType.BuildingTime,
			buildingTimeAmount
		)
		const bandwidthFee = await srccontracts.DstChainPayment.getValueOf(
			this.provider,
			ResourceType.Bandwidth,
			bandwidthAmount
		)
		const arStorageFee = await srccontracts.DstChainPayment.getValueOf(
			this.provider,
			ResourceType.ARStorage,
			arStorageAmount
		)
		const ipfsFees = await srccontracts.DstChainPayment.ipfsAlloctionsFee(
			this.provider,
			this.uuid,
			ipfsStorageAmount,
			ipfsExpiration
		)
		console.log(
			'Fees',
			buildingTimeFee.toString(),
			bandwidthFee.toString(),
			arStorageFee.toString(),
			ipfsFees.storageFee.toString(),
			ipfsFees.expirationFee.toString()
		)
		let totalFee = buildingTimeFee
			.add(bandwidthFee)
			.add(arStorageFee)
			.add(ipfsFees.storageFee)
			.add(ipfsFees.expirationFee)
		totalFee = totalFee.div(1e12)
		console.log('totalFee', totalFee.toString())
		const isIpfsExpired = await srccontracts.IPFSStorageController.isExpired(
			this.provider,
			this.uuid
		)
		console.log('isIpfsExpired', isIpfsExpired)
		if (!isIpfsExpired) {
			if (ipfsStorageAmount == 0 && ipfsExpiration == 0) {
				throw 'invalid params'
			}
			const balance = await srccontracts.IPFSStorageController.balanceOf(
				this.provider,
				this.uuid
			)
			console.log('balance', balance.toString())
			const expiration = await srccontracts.IPFSStorageController.expiration(
				this.provider,
				this.uuid
			)
			console.log('expiration', expiration.toString())
		} else {
			if (ipfsStorageAmount == 0 || ipfsExpiration == 0) {
				throw 'invalid params'
			}
		}

		const nonce = Math.floor(Date.now() / 1000)
		const payloads = [
			{
				resourceType: 1,
				values: [buildingTimeFee],
			},
			{
				resourceType: 2,
				values: [bandwidthFee],
			},
			{
				resourceType: 3,
				values: [arStorageFee],
			},
			{
				resourceType: 4,
				values: [ipfsFees.storageFee, ipfsFees.expirationFee],
			},
		]
		const minSend = await srccontracts.Bridge.minSend(
			srccontracts.GoerliUSDC.address
		)
		console.log('minSend', minSend.toString())
		if (totalFee.lt(minSend)) {
			throw 'too less token'
		}
		const messageFee = await srccontracts.SrcChainPayment.calcFee(
			this.provider,
			nonce,
			this.uuid,
			payloads
		)
		console.log('messageFee', messageFee.toString())
		const response = await client.estimate(account, totalFee.toString())
		console.log(response.toObject())
		const maxSlippage = response.getMaxSlippage()
		const getEstimatedReceiveAmt = response.getEstimatedReceiveAmt()
		console.log('celer response', maxSlippage, getEstimatedReceiveAmt)
		const tx = await srccontracts.SrcChainPayment.pay(
			this.provider,
			nonce,
			this.uuid,
			payloads,
			maxSlippage,
			{ value: messageFee }
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log('receipt', receipt)
	}

	async payDstChain() {
		const account = this.$store.state.account
		console.log('account', account)
		const uuidRegistered = await srccontracts.ProviderController.accountExists(
			this.provider,
			this.uuid
		)
		if (!uuidRegistered) {
			throw 'account is not registered'
		}
		const oneGB = 1 << 30
		const buildingTimeAmount = 200 * 60 // 200 minutes
		const bandwidthAmount = oneGB //100 * 1024 * 1024 * 1024 //100GB
		const arStorageAmount = oneGB //1 * 1024 * 1024 // 100GB
		let ipfsStorageAmount = 0 //100 * 1024 * 1024 * 1024 // 100GB
		let ipfsExpiration = 3600 // 3600
		const buildingTimeFee = await dstcontracts.DstChainPayment.getValueOf(
			this.provider,
			ResourceType.BuildingTime,
			buildingTimeAmount
		)
		const bandwidthFee = await dstcontracts.DstChainPayment.getValueOf(
			this.provider,
			ResourceType.Bandwidth,
			bandwidthAmount
		)
		const arStorageFee = await dstcontracts.DstChainPayment.getValueOf(
			this.provider,
			ResourceType.ARStorage,
			arStorageAmount
		)
		const ipfsFees = await dstcontracts.DstChainPayment.ipfsAlloctionsFee(
			this.provider,
			this.uuid,
			ipfsStorageAmount,
			ipfsExpiration
		)
		console.log(
			'Fees',
			buildingTimeFee.toString(),
			bandwidthFee.toString(),
			arStorageFee.toString(),
			ipfsFees.storageFee.toString(),
			ipfsFees.expirationFee.toString()
		)
		let totalFee = buildingTimeFee
			.add(bandwidthFee)
			.add(arStorageFee)
			.add(ipfsFees.storageFee)
			.add(ipfsFees.expirationFee)
		totalFee = totalFee.div(1e12)
		console.log('totalFee', totalFee.toString())
		const isIpfsExpired = await srccontracts.IPFSStorageController.isExpired(
			this.provider,
			this.uuid
		)
		console.log('isIpfsExpired', isIpfsExpired)
		if (!isIpfsExpired) {
			if (ipfsStorageAmount == 0 && ipfsExpiration == 0) {
				throw 'invalid params'
			}
			const balance = await srccontracts.IPFSStorageController.balanceOf(
				this.provider,
				this.uuid
			)
			console.log('balance', balance.toString())
			const expiration = await srccontracts.IPFSStorageController.expiration(
				this.provider,
				this.uuid
			)
			console.log('expiration', expiration.toString())
		} else {
			if (ipfsStorageAmount == 0 || ipfsExpiration == 0) {
				throw 'invalid params'
			}
		}
		const nonce = Math.floor(Date.now() / 1000)
		const payloads = [
			{
				resourceType: 1,
				values: [buildingTimeFee],
			},
			{
				resourceType: 2,
				values: [bandwidthFee],
			},
			{
				resourceType: 3,
				values: [arStorageFee],
			},
			{
				resourceType: 4,
				values: [ipfsFees.storageFee, ipfsFees.expirationFee],
			},
		]
		const tx = await dstcontracts.DstChainPayment.pay({
			provider: this.provider,
			nonce,
			account: this.uuid,
			payloads,
		})
		console.log('tx', tx)
		const receipt = await tx.wait(1)
		console.log('receipt', receipt)

		const buildingTime = await dstcontracts.BuildingTimeController.balanceOf(
			this.provider,
			this.uuid
		)
		console.log('buildingTime', buildingTime.toString())
		const bandwidth = await dstcontracts.BandwidthController.balanceOf(
			this.provider,
			this.uuid
		)
		console.log('bandwidth', bandwidth.toString())
		const arstorage = await dstcontracts.ARStorageController.balanceOf(
			this.provider,
			this.uuid
		)
		console.log('arstorage', arstorage.toString())

		const ipfsStorage = await dstcontracts.IPFSStorageController.balanceOf(
			this.provider,
			this.uuid
		)
		console.log('ipfsStorage', ipfsStorage.toString())
		const availableExpiration =
			await dstcontracts.IPFSStorageController.availableExpiration(
				this.provider,
				this.uuid
			)
		console.log('ipfsExpiration', availableExpiration.toString())
	}

	// async safeSign() {
	// 	const from = this.$store.state.account
	// 	console.log(from)
	// 	if (!from) {
	// 		return
	// 	}
	// 	const isProvider = await contracts.Providers.isProvider(from)
	// 	console.log('isProvider', isProvider)
	// 	const chainId = await contracts.signer.getChainId()
	// 	const verifyingContract = contracts.SafeWalletAddr
	// 	const token = await contracts.FundWallet.token()
	// 	const to = contracts.FundWalletAddr
	// 	const value = 0
	// 	const data = contracts.FundWallet.interface.encodeFunctionData(
	// 		'ownerWithdrawERC20',
	// 		[token, from, BigNumber.from((1e6).toString())]
	// 	)
	// 	const operation = 0
	// 	const safeTxGas = 0
	// 	const baseGas = 0
	// 	const gasPrice = 0
	// 	const gasToken = '0x' + Buffer.alloc(20, 0).toString('hex')
	// 	const refundReceiver = from
	// 	const nonce = await contracts.SafeWallet.nonce()
	// 	console.log('nonce', nonce)
	// 	const rechargeSig = await contracts.signer._signTypedData(
	// 		{
	// 			chainId,
	// 			verifyingContract,
	// 		},
	// 		{
	// 			SafeTx: [
	// 				{ name: 'to', type: 'address' },
	// 				{ name: 'value', type: 'uint256' },
	// 				{ name: 'data', type: 'bytes' },
	// 				{ name: 'operation', type: 'uint8' },
	// 				{ name: 'safeTxGas', type: 'uint256' },
	// 				{ name: 'baseGas', type: 'uint256' },
	// 				{ name: 'gasPrice', type: 'uint256' },
	// 				{ name: 'gasToken', type: 'address' },
	// 				{ name: 'refundReceiver', type: 'address' },
	// 				{ name: 'nonce', type: 'uint256' },
	// 			],
	// 		},
	// 		{
	// 			to,
	// 			value,
	// 			data,
	// 			operation,
	// 			safeTxGas,
	// 			baseGas,
	// 			gasPrice,
	// 			gasToken,
	// 			refundReceiver,
	// 			nonce,
	// 		}
	// 	)
	// 	const doaminTypeHash = utils.keccak256(
	// 		Buffer.from('EIP712Domain(uint256 chainId,address verifyingContract)')
	// 	)
	// 	const domainStructHash = utils.keccak256(
	// 		utils.defaultAbiCoder.encode(
	// 			['bytes32', 'uint256', 'address'],
	// 			[doaminTypeHash, chainId, verifyingContract]
	// 		)
	// 	)
	// 	const messageTypes =
	// 		'SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)'
	// 	const messageTypeHash = utils.keccak256(Buffer.from(messageTypes))
	// 	console.log('messageTypeHash', messageTypeHash, data)
	// 	const messageStructHash = utils.keccak256(
	// 		utils.defaultAbiCoder.encode(
	// 			[
	// 				'bytes32',
	// 				'address',
	// 				'uint256',
	// 				'bytes32',
	// 				'uint8',
	// 				'uint256',
	// 				'uint256',
	// 				'uint256',
	// 				'address',
	// 				'address',
	// 				'uint256',
	// 			],
	// 			[
	// 				messageTypeHash,
	// 				to,
	// 				value,
	// 				utils.keccak256(Buffer.from(data.substring(2), 'hex')),
	// 				operation,
	// 				safeTxGas,
	// 				baseGas,
	// 				gasPrice,
	// 				gasToken,
	// 				refundReceiver,
	// 				nonce,
	// 			]
	// 		)
	// 	)
	// 	const hash = utils.keccak256(
	// 		Buffer.concat([
	// 			Buffer.from('1901', 'hex'),
	// 			Buffer.from(domainStructHash.substring(2), 'hex'),
	// 			Buffer.from(messageStructHash.substring(2), 'hex'),
	// 		])
	// 	)
	// 	console.log('hash', hash)
	// 	const encoded = await contracts.SafeWallet.encodeTransactionData(
	// 		to,
	// 		value,
	// 		data,
	// 		operation,
	// 		safeTxGas,
	// 		baseGas,
	// 		gasPrice,
	// 		gasToken,
	// 		refundReceiver,
	// 		nonce
	// 	)
	// 	const encodedHash = utils.keccak256(encoded)
	// 	console.log('encodedHash', encodedHash)
	// 	const sig = rechargeSig
	// 	const address = utils.recoverAddress(hash, sig)
	// 	console.log('rechargeSig', rechargeSig, 'recoverAddress', address)

	// 	const withdrawTxData = contracts.SafeWallet.interface.encodeFunctionData(
	// 		'execTransaction',
	// 		[
	// 			to,
	// 			value,
	// 			data,
	// 			operation,
	// 			safeTxGas,
	// 			baseGas,
	// 			gasPrice,
	// 			gasToken,
	// 			refundReceiver,
	// 			sig,
	// 		]
	// 	)
	// 	const receipt = await dstcontracts.sendTransaction({
	// 		to: dstcontracts.SafeWalletAddr,
	// 		data: withdrawTxData,
	// 	})
	// 	console.log('receipt', receipt)
	// }

	async callSGN() {
		// const account = this.$store.state.account
		// const estimateRequest = new EstimateAmtRequest()
		// estimateRequest.setSrcChainId(5)
		// estimateRequest.setDstChainId(80001)
		// estimateRequest.setTokenSymbol('USDC')
		// estimateRequest.setUsrAddr(account)
		// estimateRequest.setSlippageTolerance(3000)
		// estimateRequest.setAmt('100000000000')
		// const client = new WebClient(
		// 	'https://cbridge-v2-test.celer.network',
		// 	null,
		// 	null
		// )
		// const res = await client.estimateAmt(estimateRequest, null)
		// console.log(res.toObject())
		// const maxSlippage = res.getMaxSlippage()
		// const request = new TransferHistoryRequest()
		// request.setAddr('0xb250c5a0a4c7304d4fa115596660d2ff4604de04')
		// request.setPageSize(5)
		// const client = new WebClient(
		// 	'https://cbridge-v2-test.celer.network',
		// 	null,
		// 	null
		// )
		// const response = await client.transferHistory(request, null)
		// console.log(response.toObject())
		// "0xebf29d6011ee83dfc76cf9610c686b513397493550f7c2fec055742960483527"
		// const request = new GetTransferStatusRequest()
		// request.setTransferId(
		// 	'0xebf29d6011ee83dfc76cf9610c686b513397493550f7c2fec055742960483527'
		// )
		// const client = new WebClient(
		// 	'https://cbridge-v2-test.celer.network',
		// 	null,
		// 	null
		// )
		// const response = await client.getTransferStatus(request, null)
		// console.log(response.toObject())
		// const timestamp = Math.floor(Date.now() / 1000)
		// const withdrawReq = new WithdrawReq()
		// withdrawReq.setReqId(timestamp)
		// withdrawReq.setXferId(
		// 	'0xebf29d6011ee83dfc76cf9610c686b513397493550f7c2fec055742960483527'
		// )
		// withdrawReq.setWithdrawType(WithdrawType.WITHDRAW_TYPE_REFUND_TRANSFER)
		// withdrawReq.setExitChainId(5)
		// const request = new WithdrawLiquidityRequest()
		// request.setWithdrawReq(withdrawReq.serializeBinary())
		// request.setMethodType(WithdrawMethodType.WD_METHOD_TYPE_ONE_RM)
		// const client = new WebClient(
		// 	'https://cbridge-v2-test.celer.network',
		// 	null,
		// 	null
		// )
		// const response = await client.withdrawLiquidity(request, null)
		// console.log(response.toObject())
	}

	async approveFundPool() {
		const tx = await dstcontracts.MumbaiUSDC.approve(
			dstcontracts.FundPool.address,
			uint256Max
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log(receipt)
	}

	async recharge() {
		const from = this.$store.state.account
		if (!from) {
			return
		}
		const isProvider = await dstcontracts.ProviderRegistry.isProvider(
			this.provider
		)
		console.log('isProvider', isProvider)
		
		const receipt = await dstcontracts.FundPool.recharge(this.provider, this.uuid, BigNumber.from('1000000'))
		console.log('receipt', receipt)
		const balance = await dstcontracts.FundPool.balanceOf(
			this.provider,
			this.uuid
		)
		console.log('balance', balance.toString())
	}

	async bill() {
		const from = this.$store.state.account
		if (!from) {
			return
		}
		const isProvider = await dstcontracts.ProviderRegistry.isProvider(
			this.provider
		)
		console.log('isProvider', isProvider)
		// 	Bills(address provider,uint64 nonce,bytes32 account,bytes bills,uint256 expiration)
		const price = await dstcontracts.ResourcePriceAdaptor.priceOf(
			this.provider,
			2
		)
		const name = 'Billing'
		const version = 'V1'
		const chainId = await dstcontracts.signer.getChainId()
		const verifyingContract = dstcontracts.Billing.address
		const nonce = Math.floor(Date.now() / 1000)
		const amount = 100000000
		const value = price.mul(amount).div(BigNumber.from((1e12).toString()))
		const balance = await dstcontracts.FundPool.balanceOf(
			this.provider,
			this.uuid
		)
		const indexBlock = await dstcontracts.ResourcePriceAdaptor.priceIndexBlocks(
			this.provider
		)
		console.log('balance', balance.toString())
		console.log('value', value.toString())
		const bills = utils.defaultAbiCoder.encode(
			['(uint256,(uint256,uint256)[])[]'],
			[[[indexBlock, [[2, amount]]]]]
		)
		console.log('encodeBills', bills)
		const timeout = Math.floor(Date.now() / 1000) + 900
		// Billing(address provider,bytes32 account,bytes bills,uint256 timeout,uint64 nonce)
		const billSig = await dstcontracts.signer._signTypedData(
			{
				name,
				version,
				chainId,
				verifyingContract,
			},
			{
				// EIP712Domain: [
				// 	{ name: 'name', type: 'string' },
				// 	{ name: 'version', type: 'string' },
				// 	{ name: 'chainId', type: 'uint256' },
				// 	{ name: 'verifyingContract', type: 'address' },
				// ],
				Billing: [
					{ name: 'provider', type: 'address' },
					{ name: 'account', type: 'bytes32' },
					{ name: 'bills', type: 'bytes' },
					{ name: 'timeout', type: 'uint256' },
					{ name: 'nonce', type: 'uint64' },
				],
			},
			{
				provider: this.provider,
				account: this.uuid,
				bills,
				timeout,
				nonce,
			}
		)
		console.log('billSig', billSig)
		const doaminTypeHash = utils.keccak256(
			Buffer.from(
				'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
			)
		)
		const domainStructHash = utils.keccak256(
			utils.defaultAbiCoder.encode(
				['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
				[
					doaminTypeHash,
					utils.keccak256(Buffer.from(name)),
					utils.keccak256(Buffer.from(version)),
					chainId,
					verifyingContract,
				]
			)
		)
		const messageTypes =
			'Billing(address provider,bytes32 account,bytes bills,uint256 timeout,uint64 nonce)'
		const messageTypeHash = utils.keccak256(Buffer.from(messageTypes))
		const messageStructHash = utils.keccak256(
			utils.defaultAbiCoder.encode(
				['bytes32', 'address', 'bytes32', 'bytes32', 'uint256', 'uint64'],
				[
					messageTypeHash,
					this.provider,
					this.uuid,
					utils.keccak256(bills),
					timeout,
					nonce,
				]
			)
		)
		const hash = utils.keccak256(
			Buffer.concat([
				Buffer.from('1901', 'hex'),
				Buffer.from(domainStructHash.substring(2), 'hex'),
				Buffer.from(messageStructHash.substring(2), 'hex'),
			])
		)
		console.log('hash', hash)
		const cHash = await dstcontracts.Billing.hashTypedDataV4ForBills(
			this.provider,
			this.uuid,
			bills,
			timeout,
			nonce
		)
		console.log('cHash', cHash)
		const sig = billSig
		const address = utils.recoverAddress(hash, sig)
		console.log('billSig', billSig, 'recoverAddress', address)
		const tx = await dstcontracts.FundPool.spend(
			this.provider,
			this.uuid,
			bills,
			timeout,
			nonce,
			sig
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log('receipt', receipt)
		const balanceOfAccount = await dstcontracts.FundPool.balanceOf(
			this.provider,
			this.uuid
		)
		console.log('balanceOf account', balanceOfAccount.toString())
		const balanceOfProvider = await dstcontracts.Billing.balanceOf(
			this.provider
		)
		console.log('balanceOf provider', balanceOfProvider.toString())
	}

	async withdraw() {
		const from = this.$store.state.account
		if (!from) {
			return
		}
		const isProvider = await dstcontracts.ProviderRegistry.isProvider(from)
		console.log('isProvider', isProvider)
		const price = await dstcontracts.ResourcePriceAdaptor.priceOf(
			this.provider,
			2
		)
		const name = 'Billing'
		const version = 'V1'
		const chainId = await dstcontracts.signer.getChainId()
		const verifyingContract = dstcontracts.Billing.address
		const nonce = Math.floor(Date.now() / 1000)
		const amount = 100000000
		const value = price.mul(amount).div(BigNumber.from((1e12).toString()))
		const balance = await dstcontracts.FundPool.balanceOf(
			this.provider,
			this.uuid
		)
		const indexBlock = await dstcontracts.ResourcePriceAdaptor.priceIndexBlocks(
			this.provider
		)
		console.log('balance', balance.toString())
		console.log('value', value.toString())
		const bills = utils.defaultAbiCoder.encode(
			['(uint256,(uint256,uint256)[])[]'],
			[[[indexBlock, [[2, amount]]]]]
		)
		console.log('encodeBills', bills)
		const timeout = Math.floor(Date.now() / 1000) + 900
		// Billing(address provider,bytes32 account,bytes bills,uint256 timeout,uint64 nonce)
		const billSig = await dstcontracts.signer._signTypedData(
			{
				name,
				version,
				chainId,
				verifyingContract,
			},
			{
				// EIP712Domain: [
				// 	{ name: 'name', type: 'string' },
				// 	{ name: 'version', type: 'string' },
				// 	{ name: 'chainId', type: 'uint256' },
				// 	{ name: 'verifyingContract', type: 'address' },
				// ],
				Billing: [
					{ name: 'provider', type: 'address' },
					{ name: 'account', type: 'bytes32' },
					{ name: 'bills', type: 'bytes' },
					{ name: 'timeout', type: 'uint256' },
					{ name: 'nonce', type: 'uint64' },
				],
			},
			{
				provider: this.provider,
				account: this.uuid,
				bills,
				timeout,
				nonce,
			}
		)
		console.log('billSig', billSig)
		const doaminTypeHash = utils.keccak256(
			Buffer.from(
				'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
			)
		)
		const domainStructHash = utils.keccak256(
			utils.defaultAbiCoder.encode(
				['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
				[
					doaminTypeHash,
					utils.keccak256(Buffer.from(name)),
					utils.keccak256(Buffer.from(version)),
					chainId,
					verifyingContract,
				]
			)
		)
		const messageTypes =
			'Billing(address provider,bytes32 account,bytes bills,uint256 timeout,uint64 nonce)'
		const messageTypeHash = utils.keccak256(Buffer.from(messageTypes))
		const messageStructHash = utils.keccak256(
			utils.defaultAbiCoder.encode(
				['bytes32', 'address', 'bytes32', 'bytes32', 'uint256', 'uint64'],
				[
					messageTypeHash,
					this.provider,
					this.uuid,
					utils.keccak256(bills),
					timeout,
					nonce,
				]
			)
		)
		const hash = utils.keccak256(
			Buffer.concat([
				Buffer.from('1901', 'hex'),
				Buffer.from(domainStructHash.substring(2), 'hex'),
				Buffer.from(messageStructHash.substring(2), 'hex'),
			])
		)
		console.log('hash', hash)
		const cHash = await dstcontracts.Billing.hashTypedDataV4ForBills(
			this.provider,
			this.uuid,
			bills,
			timeout,
			nonce
		)
		console.log('cHash', cHash)
		const sig = billSig
		const address = utils.recoverAddress(hash, sig)
		console.log('billSig', billSig, 'recoverAddress', address)
		const tx = await dstcontracts.FundPool.withdraw(
			this.provider,
			this.uuid,
			bills,
			timeout,
			nonce,
			sig,
			from,
			10e6
		)
		console.log('tx', tx)
		const receipt = await tx.wait()
		console.log('receipt', receipt)
		const balanceOfAccount = await dstcontracts.FundPool.balanceOf(
			this.provider,
			this.uuid
		)
		console.log('account balanceOf', balanceOfAccount.toString())
		const balanceOfProvider = await dstcontracts.Billing.balanceOf(
			this.provider
		)
		console.log('provider balanceO', balanceOfProvider.toString())
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
