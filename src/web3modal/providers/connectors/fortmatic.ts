import { IAbstractConnectorOptions } from '../../helpers'

export interface IFortmaticConnectorOptions extends IAbstractConnectorOptions {
	key: string;
}

const ConnectToFortmatic = async (
	Fortmatic: any,
	opts: IFortmaticConnectorOptions
) => {
	if (opts && opts.key) {
		const key = opts.key
		const fm = new Fortmatic(key, opts.network)
		const provider = await fm.getProvider()
		provider.fm = fm
		await fm.user.login()
		const isLoggedIn = await fm.user.isLoggedIn()
		if (isLoggedIn) {
			return provider
		} else {
			throw new Error('Failed to login to Fortmatic')
		}
	} else {
		throw new Error('Missing Fortmatic key')
	}
}

export default ConnectToFortmatic
