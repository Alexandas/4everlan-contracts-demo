import { Vue, Component } from 'vue-property-decorator'
import { UPDATE_LOADING } from '@/store'
@Component
export default class Mixin extends Vue {

	public popError(e: any) {
		if (!e) return
		if (typeof e === 'string') {
			return this.$message.error(e)
		} else if (e.message) {
			return this.$message.error(e.message)
		} else {
			return this.$message.error(JSON.stringify(e))
		}
	}

	public startLoading() {
		this.$store.commit(UPDATE_LOADING, true)
	}

	public endLoading() {
		this.$store.commit(UPDATE_LOADING, false)
	}
}
