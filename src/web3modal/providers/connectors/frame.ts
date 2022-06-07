const ConnectToFrame = async (ethProvider: any) => {
	const provider = ethProvider('frame')
	provider.isFrameNative = true
	return provider
}

export default ConnectToFrame
