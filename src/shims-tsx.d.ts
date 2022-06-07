import Vue, { VNode } from 'vue'

declare global {

	namespace JSX {
		// tslint:disable no-empty-interface
		interface Element extends VNode { }
		// tslint:disable no-empty-interface
		interface ElementClass extends Vue { }
		interface IntrinsicElements {
			[elem: string]: any
		}
	}

	interface Window {
		BinanceChain: any;
		web3: any;
		celo: any;
		updateWeb3Modal: any;
		ethereum: {
			chainId: string
			on: (event: string, listener: (...args: any[]) => void) => void
			isConnected: () => boolean
			enable: () => Promise<any>
			isMetaMask: boolean
			_metamask: {
				isUnlocked(): Promise<boolean>;
			}

			request: (options: {
				method: 'eth_sendTransaction' | 'eth_call' | 'eth_requestAccounts' | 'eth_accounts' | 'eth_getBalance',
				params?: {
					from?: string
					to?: string
					gas?: string
					gasPrice?: string
					value?: string
					data?: string
				}[] | any[]
			}) => Promise<any>
		}
	}

	interface Deployment {
		address: string,
		abi: any[]
	}

	interface CallOption {
		from?: string,
		to?: string,
		value?: string,
		gas?: string,
		gasPrice?: string
	}
}
