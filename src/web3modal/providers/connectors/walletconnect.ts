import { IAbstractConnectorOptions, getChainId } from '../../helpers'

export interface IWalletConnectConnectorOptions
	extends IAbstractConnectorOptions {
	infuraId?: string;
	rpc?: { [chainId: number]: string };
	bridge?: string;
	qrcode?: boolean;
	qrcodeModalOptions?: { mobileLinks?: string[] };
}

const ConnectToWalletConnect = async (
	WalletConnectProvider: any,
	opts: IWalletConnectConnectorOptions
) => {
	let bridge = 'https://bridge.walletconnect.org'
	let qrcode = true
	let infuraId = ''
	let rpc = undefined
	let chainId = 1
	let qrcodeModalOptions = undefined

	if (opts) {
		bridge = opts.bridge || bridge
		qrcode = typeof opts.qrcode !== 'undefined' ? opts.qrcode : qrcode
		infuraId = opts.infuraId || ''
		rpc = opts.rpc || undefined
		chainId =
			opts.network && getChainId(opts.network) ? getChainId(opts.network) : 1
		qrcodeModalOptions = opts.qrcodeModalOptions || undefined
	}

	const provider = new WalletConnectProvider({
		bridge,
		qrcode,
		infuraId,
		rpc,
		chainId,
		qrcodeModalOptions
	})
	try {
		await provider.enable()
		return provider
	} catch (e) {
		return Promise.reject(e)
	}
}

export default ConnectToWalletConnect
