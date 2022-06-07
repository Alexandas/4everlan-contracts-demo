import { IAbstractConnectorOptions } from '../../helpers'

export interface IVenlyConnectorOptions extends IAbstractConnectorOptions {
	clientId: string;
	secretType?: string;
	environment?: string;
}

const ConnectToVenly = async (Venly: any, opts: IVenlyConnectorOptions) => {
	if (opts && opts.clientId) {
		try {
			const options = {
				clientId: opts.clientId,
				secretType: opts.secretType || 'ETHEREUM',
				environment: opts.environment,
				signMethod: 'POPUP'
			}
			const provider = await (window as any).Venly.createProviderEngine(
				options
			)
			return provider
		} catch (error) {
			console.error(error)
			return Promise.reject(new Error('Failed to login to Venly'))
		}
	} else {
		return Promise.reject(new Error('Please provide an Venly client id'))
	}
}

export default ConnectToVenly
