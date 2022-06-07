<template>
	<div
		class="SProviderWrapper"
		@click="click"
	>
		<div class="SProviderContainer">
			<img
				class="SIcon"
				:src="logo"
				:alt="name"
			>
			<span class="SName">
				{{ name }}
			</span>
			<span class="SDescription">
				{{ description }}
			</span>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Provider extends Vue {
	@Prop({ default: '' })
	logo!: string

	@Prop({ default: 'name' })
	name!: string

	@Prop({ default: 'description' })
	description!: string

	@Prop({ default: () => {} })
	onClick!: () => void

	click() {
		this.onClick()
	}
}
</script>
<style>
.SIcon {
	width: 45px;
	height: 45px;
	display: flex;
	border-radius: 50%;
	overflow: visible;
	box-shadow: none;
	justify-content: center;
	align-items: center;

	@media screen and (max-width: 768px) {
		width: 8.5vw;
		height: 8.5vw;
	}
}
.SProviderWrapper {
	width: 100%;
	padding: 8px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	cursor: pointer;
	border-radius: 0;
	@media (hover: hover) {
		&:hover SProviderContainer {
			background-color: red;
		}
	}
}
.SProviderContainer {
	transition: background-color 0.2s ease-in-out;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: yellow;
	border-radius: 12px;
	padding: 24px 16px;
	@media screen and (max-width: 768px) {
		padding: 1vw;
	}
}
.SProviderWrapper {
	width: 100%;
	padding: 8px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	cursor: pointer;
	border-radius: 0;
	border: 1px solid;
	@media (hover: hover) {
		&:hover SProviderContainera {
			background-color: cyan;
		}
	}
}
.SName {
	width: 100%;
	font-size: 24px;
	font-weight: 700;
	margin-top: 0.5em;
	color: black;
	@media screen and (max-width: 768px) {
		font-size: 5vw;
	}
}

.SDescription {
	width: 100%;
	font-size: 18px;
	margin: 0.333em 0;
	color: black;
	@media screen and (max-width: 768px) {
		font-size: 4vw;
	}
}
</style>
