import {
	EstimateAmtRequest,
	// TransferHistoryRequest,
	// GetTransferStatusRequest,
	// WithdrawLiquidityRequest,
	// WithdrawMethodType,
	// InitWithdrawRequest,
} from '@/sgn/ts-proto/gateway/gateway_pb'
import { WebClient } from '@/sgn/ts-proto/gateway/GatewayServiceClientPb'

class SGNClient {
	private client: WebClient

	constructor() {
		this.client = new WebClient(
			'https://cbridge-v2-test.celer.network',
			null,
			null
		)
	}

	public async estimate(address: string, value: string, src?: number, dst?: number, token?: string) {
		const estimateRequest = new EstimateAmtRequest()
		estimateRequest.setSrcChainId(src || 5)
		estimateRequest.setDstChainId(dst || 80001)
		estimateRequest.setTokenSymbol(token || 'USDC')
		estimateRequest.setUsrAddr(address)
		estimateRequest.setSlippageTolerance(3000)
		estimateRequest.setAmt(value)
		return this.client.estimateAmt(estimateRequest, null)
	}

}

const client = new SGNClient()
export default client