const ConnectToInjected = async () => {
	let provider = null
	if (typeof window.ethereum !== 'undefined') {
		provider = window.ethereum
		try {
			await provider.request({ method: 'eth_requestAccounts' })
		} catch (error) {
			throw new Error('User Rejected')
		}
	} else if ((window as any).web3) {
		provider = (window as any).web3.currentProvider
	} else if ((window as any).celo) {
		provider = (window as any).celo
	} else {
		throw new Error('No Web3 Provider found')
	}
	return provider
}

export default ConnectToInjected
