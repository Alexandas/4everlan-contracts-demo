<template>
	<div
		:style="showStyle"
		@click="onClose"
	>
		<div class="SLightbox" />
		<div class="SBox">
			<div class="SModalContainer">
				<Provider
					v-for="opt in props.userOptions"
					:key="opt.name"
					class="SModalCard"
					:name="opt.name"
					:logo="opt.logo"
					:description="opt.description"
					:on-click="opt.onClick"
				/>>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { SimpleFunction, IProviderUserOptions } from '../helpers'
import Provider from './Provider.vue'

interface IModalProps {
	userOptions: IProviderUserOptions[]
	onClose: SimpleFunction
}

@Component({
	components: { Provider },
})
export default class Modal extends Vue {
	@Prop({ default: {} })
	props!: IModalProps

	@Prop({ default: true })
	show!: boolean

	onClose() {
		this.props.onClose()
	}

	get showStyle() {
		return this.show
			? 'display: block; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4); '
			: 'display: none;'
	}
}
</script>
<style>
.SLightbox {
	transition: opacity 0.1s ease-in-out;
	text-align: center;
	position: fixed;
	width: 100%;
	height: 100%;
	margin-left: -50vw;
	top: 0;
	left: 50%;
	will-change: opacity;
	/* background-color: rgba(33, 33, 33, 0.4); */
	opacity: 0.4;
	visibility: visible;
	pointer-events: auto;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box !important;
}

.SBox {
	text-align: center;
	position: fixed;
	width: 100%;
	height: 100%;
	margin-left: -50vw;
	top: 0;
	left: 50%;
	will-change: opacity;
	/* background-color: rgba(0, 0, 0, 0.4); */
	visibility: visible;
	pointer-events: auto;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box !important;
}

.SModalContainer {
	max-width: 750px;
	position: relative;
	width: 100%;
	height: 100%;
	padding: 15px;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 1;
	mix-blend-mode: add;
	visibility: visible;
	pointer-events: auto;
}

.SHitbox {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.SModalCard {
	position: relative;
	width: 100%;
	background-color: white;
	border-radius: 12px;
	margin: 10px;
	padding: 0;
	opacity: 1;
	visibility: visible;
	pointer-events: auto;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	max-width: 800px;
	min-width: fit-content;
	max-height: 100%;
	overflow: auto;
	@media screen and (max-width: 768px) {
		max-width: 500px;
		grid-template-columns: 1fr;
	}
}
</style>
