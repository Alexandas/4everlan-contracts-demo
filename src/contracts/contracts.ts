import { BigNumber, providers } from 'ethers'

export default class Contracts {

	private confirmations = 1

	private provider?: providers.Web3Provider

	public setProvider(provider: providers.Web3Provider) {
		this.provider = provider
	}

	public async sendTransaction(tx: {
		to: string,
		data: string,
		value?: BigNumber,
		gasPrice?: BigNumber,
		gasLimit?: BigNumber
	}) {
		const from = await this.signer.getAddress()
		const mytx = await this.signer.sendTransaction({
			from,
			...tx
		})
		return mytx.wait(this.confirmations)
	}

	public get signer() {
		this.validateProvider()
		return this.provider!.getSigner()
	}

	public async chainId() {
		return this.signer.getChainId()
	}

	private validateProvider() {
		if (!this.provider) {
			throw new Error('provider not found')
		}
	}

}