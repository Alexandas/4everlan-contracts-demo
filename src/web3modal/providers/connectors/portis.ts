import { IAbstractConnectorOptions } from '../../helpers'

export interface INetwork {
	nodeUrl: string;
	chainId?: string;
	gasRelayHubAddress?: string;
}

export type Scope = 'email';

export interface IOptions {
	scope?: Scope[];
	gasRelay?: boolean;
	registerPageByDefault?: boolean;
	pocketDevId?: string;
}

export interface IPortisConnectorOptions extends IAbstractConnectorOptions {
	id: string;
	config?: IOptions;
}

const ConnectToPortis = async (Portis: any, opts: IPortisConnectorOptions) => {
	if (opts && opts.id) {
		try {
			const id = opts.id
			const network = opts.network || 'mainnet'
			const config = opts.config
			const pt = new Portis(id, network, config)
			await pt.provider.enable()
			pt.provider._portis = pt
			return pt.provider
		} catch (error) {
			return Promise.reject(error)
		}
	} else {
		return Promise.reject(new Error('Missing Portis Id'))
	}

}

export default ConnectToPortis
