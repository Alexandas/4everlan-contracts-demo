import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)

export const UPDATE_ACCOUNT = 'update-account'
export const UPDATE_CHAINID = 'update-chainId'
export const UPDATE_LOADING = 'UPDATE_LOADING'

interface AccountState {
	account: string
	chainId: string
	loading: boolean
}

class AccountStore extends Vuex.Store<AccountState>{
	constructor() {
		super({
			state: {
				account: '',
				chainId: '',
				loading: false
			},
			mutations: {
				[UPDATE_ACCOUNT](state: AccountState, account: string) {
					state.account = account
				},
				[UPDATE_CHAINID](state: AccountState, chainId: string) {
					state.chainId = chainId
				},
				[UPDATE_LOADING](state: AccountState, loading: boolean) {
					state.loading = loading
				},
			}
		})
	}

	public init(state: AccountState) {
		this.commit(UPDATE_ACCOUNT, state.account)
		this.commit(UPDATE_CHAINID, state.chainId)
	}

}

const store = new AccountStore()

export default store