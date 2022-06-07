import { IAbstractConnectorOptions } from '../../helpers'

export interface IAuthereumConnectorOptions extends IAbstractConnectorOptions {
	networkName: string;
	apiKey: string;
	rpcUri: string;
	webUri: string;
	xsUri: string;
	blockedPopupRedirect: boolean;
	forceRedirect: boolean;
	disableNotifications: boolean;
	disableGoogleAnalytics: boolean;
}

const ConnectToAuthereum = async (
	Authereum: any,
	opts: Partial<IAuthereumConnectorOptions> = {}
) => {
	try {
		const authereum = new Authereum({
			...opts,
			networkName: opts.networkName || opts.network
		})
		const provider = authereum.getProvider()
		provider.authereum = authereum
		await provider.enable()
		return Promise.resolve(provider)
	} catch (error) {
		return Promise.reject(error)
	}
}

export default ConnectToAuthereum
