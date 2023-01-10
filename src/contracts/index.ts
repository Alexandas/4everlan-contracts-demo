import { providers } from 'ethers'
import { ContentIDRegistry__factory, ContentIDRegistry, ERC20__factory, ERC20 } from '@4everland/content-id-registry-contracts'

class Contracts {

	private provider?: providers.Web3Provider

	public setProvider(provider: providers.Web3Provider) {
		this.provider = provider
	}

	public get getProvider() {
		return this.provider
	}

	public get signer() {
		this.validateProvider()
		return this.provider!.getSigner()
	}

	public get StableCoin(): ERC20 {
		return ERC20__factory.connect('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', this.signer)
	}

	public get ContentIDRegistry(): ContentIDRegistry {
		return ContentIDRegistry__factory.connect('0x6E73D5827b68bCc11895CA20f915e0451c3B3FaF', this.signer)
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

const contracts = new Contracts()

export default contracts