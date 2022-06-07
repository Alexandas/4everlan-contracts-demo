import Contracts from './contracts'
import {
	Router__factory,
	Router,
	Billing__factory,
	Billing,
	FundPool__factory,
	FundPool,
	Governance__factory,
	Governance,
	ProviderController__factory,
	ProviderController,
	ProviderRegistry__factory,
	ProviderRegistry,
	IERC20__factory,
	IERC20,
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
	DstChainPayment__factory,
	DstChainPayment,
	SafeWallet__factory,
	SafeWallet,
} from '4everland-contracts'

import {
	MumbaiRouter,
	MumbaiUSDC,
	MumbaiDstChainPayment,
	MumbaiResourcePriceAdaptor,
	MumbaiARStorageController,
	MumbaiBandwidthController,
	MumbaiBuildingTimeController,
	MumbaiIPFSStorageController,
	MumbaiGovernance,
	MumbaiProviderRegistry,
	MumbaiProviderController,
	MumbaiFundPool,
	MumbaiBilling,
	MumbaiSafeWallet
} from './contracts-addr'

class DstChainContracts extends Contracts {

	public get Router(): Router {
		return Router__factory.connect(MumbaiRouter, this.signer)
	}

	public get Governance(): Governance {
		return Governance__factory.connect(MumbaiGovernance, this.signer)
	}

	public get MumbaiUSDC(): IERC20 {
		return IERC20__factory.connect(MumbaiUSDC, this.signer)
	}

	public get FundPool(): FundPool {
		return FundPool__factory.connect(MumbaiFundPool, this.signer)
	}

	public get Billing(): Billing {
		return Billing__factory.connect(MumbaiBilling, this.signer)
	}

	public get ProviderController(): ProviderController {
		return ProviderController__factory.connect(MumbaiProviderController, this.signer)
	}

	public get ProviderRegistry(): ProviderRegistry {
		return ProviderRegistry__factory.connect(MumbaiProviderRegistry, this.signer)
	}

	public get SafeWallet(): SafeWallet {
		return SafeWallet__factory.connect(MumbaiSafeWallet, this.signer)
	}

	public get ResourcePriceAdaptor(): ResourcePriceAdaptor {
		return ResourcePriceAdaptor__factory.connect(MumbaiResourcePriceAdaptor, this.signer)
	}

	public get DstChainPayment(): DstChainPayment {
		return DstChainPayment__factory.connect(MumbaiDstChainPayment, this.signer)
	}

	public get ARStorageController(): ARStorageController {
		return ARStorageController__factory.connect(MumbaiARStorageController, this.signer)
	}

	public get BandwidthController(): BandwidthController {
		return BandwidthController__factory.connect(MumbaiBandwidthController, this.signer)
	}

	public get BuildingTimeController(): BuildingTimeController {
		return BuildingTimeController__factory.connect(MumbaiBuildingTimeController, this.signer)
	}

	public get IPFSStorageController(): IPFSStorageController {
		return IPFSStorageController__factory.connect(MumbaiIPFSStorageController, this.signer)
	}

}

const contracts = new DstChainContracts()

export default contracts