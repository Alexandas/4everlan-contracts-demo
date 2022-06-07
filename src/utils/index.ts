import { BigNumber } from 'ethers'

export const uint256Max = BigNumber.from('1').shl(256).sub(1)

export const toToken = (value: string, decimals = 18) => {
	const oneToken = BigNumber.from((10 ** decimals).toString())
	if (value.includes('.')) {
		const splits = value.split('.')
		const integer = splits[0]
		let sum = BigNumber.from('0')
		if (integer.length > 0) {
			sum = sum.add(BigNumber.from(integer).mul(oneToken))
		}
		const floats = splits[1]
		if (floats.length > 0) {
			sum = sum.add(BigNumber.from(floats).mul(BigNumber.from((10 ** (decimals - floats.length)).toString())))
		}
		return sum
	} else {
		return BigNumber.from(value).mul(oneToken)
	}
}

export const formatToken = (value: BigNumber, fixed = 2, decimals = 18): string => {
	const v = value.div(BigNumber.from((10 ** (decimals - fixed)).toString()))
	return (v.toNumber() / (10 ** fixed)).toFixed(fixed)
}

export const defaultDeadline = () => {
	return BigNumber.from(Math.floor(Date.now() / 1000 + 100000))
}

export const formatNetwork = (chainId: number) => {
	switch (chainId) {
		case 0x1:
			return 'Mainnet'
		case 0x3:
			return 'Ropsten'
		case 0x4:
			return 'Rinkeby'
		case 0x5:
			return 'Goerli'
		case 0x2a:
			return 'Kovan'
		case 0x13881:
			return 'Mumbai'
		default:
			return 'Unknown'
	}
}

export const isNetworkSupported = (chainId: number) => {
	return chainId == 0x4 || chainId == 0x1
}
