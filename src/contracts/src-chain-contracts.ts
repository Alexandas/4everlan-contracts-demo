import { providers } from 'ethers'
import Contracts from './contracts'

import {
	IERC20__factory,
	IERC20,
	SrcChainPayment__factory,
	SrcChainPayment,
	DstChainPayment__factory,
	DstChainPayment,
	ResourcePriceAdaptor__factory,
	ResourcePriceAdaptor,
	ARStorageController__factory,
	ARStorageController,
	BandwidthController__factory,
	BandwidthController,
	BuildingTimeController__factory,
	BuildingTimeController,
	IPFSStorageController__factory,
	IPFSStorageController,
	ProviderController__factory,
	ProviderController
} from '4everland-contracts'
import { Bridge__factory, Bridge } from '@/sgn/contract/typechain'
import {
	GoerliBridge,
	GoerliUSDC,
	GoerliSrcChainPayment,
	MumbaiDstChainPayment,
	MumbaiResourcePriceAdaptor,
	MumbaiARStorageController,
	MumbaiBandwidthController,
	MumbaiBuildingTimeController,
	MumbaiIPFSStorageController,
	MumbaiProviderController
} from './contracts-addr'

class SrcChainContracts extends Contracts {

	private dstProvider: providers.JsonRpcProvider

	constructor() {
		super()
		// mumbai rpc
		this.dstProvider = new providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com')
	}

	public get GoerliUSDC(): IERC20 {
		return IERC20__factory.connect(GoerliUSDC, this.signer)
	}

	public IERC20(addr: string): IERC20 {
		return IERC20__factory.connect(addr, this.signer)
	}

	public get Bridge(): Bridge {
		return Bridge__factory.connect(GoerliBridge, this.signer)
	}

	public get SrcChainPayment(): SrcChainPayment {
		return SrcChainPayment__factory.connect(GoerliSrcChainPayment, this.signer)
	}

	public get ResourcePriceAdaptor(): ResourcePriceAdaptor {
		return ResourcePriceAdaptor__factory.connect(MumbaiResourcePriceAdaptor, this.dstProvider)
	}

	public get DstChainPayment(): DstChainPayment {
		return DstChainPayment__factory.connect(MumbaiDstChainPayment, this.dstProvider)
	}

	public get ARStorageController(): ARStorageController {
		return ARStorageController__factory.connect(MumbaiARStorageController, this.dstProvider)
	}

	public get BandwidthController(): BandwidthController {
		return BandwidthController__factory.connect(MumbaiBandwidthController, this.dstProvider)
	}

	public get BuildingTimeController(): BuildingTimeController {
		return BuildingTimeController__factory.connect(MumbaiBuildingTimeController, this.dstProvider)
	}

	public get IPFSStorageController(): IPFSStorageController {
		return IPFSStorageController__factory.connect(MumbaiIPFSStorageController, this.dstProvider)
	}

	public get ProviderController(): ProviderController {
		return ProviderController__factory.connect(MumbaiProviderController, this.dstProvider)
	}
}

const contracts = new SrcChainContracts()

export default contracts