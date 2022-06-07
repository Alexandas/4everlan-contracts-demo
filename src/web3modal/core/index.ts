
import {
	ICoreOptions,
	IProviderUserOptions,
	SimpleFunction
} from '../helpers'
import {
	WEB3_CONNECT_MODAL_ID,
	CONNECT_EVENT,
	ERROR_EVENT,
	CLOSE_EVENT
} from '../constants'
import { themesList } from '../themes'
import { EventController, ProviderController } from '../controllers'
import Modal from '../components/Modal.vue'

const INITIAL_STATE = { show: false }

const defaultOpts: ICoreOptions = {
	lightboxOpacity: 0.4,
	theme: themesList.default.name,
	cacheProvider: false,
	disableInjectedProvider: false,
	providerOptions: {},
	network: ''
}

export class Core {
	private show: boolean = INITIAL_STATE.show;

	private eventController: EventController = new EventController();
	private providerController: ProviderController;
	private userOptions: IProviderUserOptions[];
	private modal: Modal

	constructor(opts?: Partial<ICoreOptions>) {
		const options: ICoreOptions = {
			...defaultOpts,
			...opts
		}

		this.providerController = new ProviderController({
			disableInjectedProvider: options.disableInjectedProvider,
			cacheProvider: options.cacheProvider,
			providerOptions: options.providerOptions,
			network: options.network
		})

		this.providerController.on(CONNECT_EVENT, provider =>
			this.onConnect(provider)
		)
		this.providerController.on(ERROR_EVENT, error => this.onError(error))

		this.userOptions = this.providerController.getUserOptions()

		const el = document.createElement('div')
		el.id = WEB3_CONNECT_MODAL_ID
		document.body.appendChild(el)
		const modal = new Modal({ propsData: { props: { userOptions: this.userOptions, onClose: this.onClose }, show: this.show } })
		modal.$mount(el)
		this.modal = modal
	}

	public get cachedProvider(): string {
		return this.providerController.cachedProvider
	}

	// --------------- PUBLIC METHODS --------------- //

	public connect = async (): Promise<any> => {
		if (this.cachedProvider) {
			await this.providerController.connectToCachedProvider()
			return
		}
		if (
			this.userOptions &&
			this.userOptions.length === 1 &&
			this.userOptions[0].name
		) {
			await this.userOptions[0].onClick()
			return
		}
		return new Promise<any>((resolve, reject) => {
			this.on(CONNECT_EVENT, provider => resolve(provider))
			this.on(ERROR_EVENT, error => reject(error))
			this.on(CLOSE_EVENT, () => reject('Modal closed by user'))
		})
	}

	public connectTo = async (id: string): Promise<any> => {
		const provider = this.providerController.getProvider(id)
		if (!provider) {
			throw new Error(
				`Cannot connect to provider (${id}), check provider options`
			)
		}
		this.providerController.connectTo(provider.id, provider.connector)
		return new Promise<any>((resolve, reject) => {
			this.on(CONNECT_EVENT, provider => resolve(provider))
			this.on(ERROR_EVENT, error => reject(error))
			this.on(CLOSE_EVENT, () => reject('Modal closed by user'))
		})

	}

	public async toggleModal(): Promise<void> {
		await this._toggleModal()
	}

	public on(event: string, callback: SimpleFunction): SimpleFunction {
		this.eventController.on({
			event,
			callback
		})

		return () =>
			this.eventController.off({
				event,
				callback
			})
	}

	public off(event: string, callback?: SimpleFunction): void {
		this.eventController.off({
			event,
			callback
		})
	}

	public clearCachedProvider(): void {
		this.providerController.clearCachedProvider()
	}

	public setCachedProvider(id: string): void {
		this.providerController.setCachedProvider(id)
	}

	private _toggleModal = async () => {
		this.modal.$set(this.modal, 'show', !this.show)
		this.show = !this.show
	};

	private onError = async (error: any) => {
		if (this.show) {
			await this._toggleModal()
		}
		this.eventController.trigger(ERROR_EVENT, error)
	};

	private onConnect = async (provider: any) => {
		if (this.show) {
			await this._toggleModal()
		}
		this.eventController.trigger(CONNECT_EVENT, provider)
	};

	private onClose = async () => {
		if (this.show) {
			await this._toggleModal()
		}
		this.eventController.trigger(CLOSE_EVENT)
	};

}
