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
		return ERC20__factory.connect('0xB1048018E1584BB514c335CcC0b3A23Bc5aC4634', this.signer)
	}

	public get ContentIDRegistry(): ContentIDRegistry {
		return ContentIDRegistry__factory.connect('0x172498e09BAA8CFeAd011396d87589067d9c0B64', this.signer)
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