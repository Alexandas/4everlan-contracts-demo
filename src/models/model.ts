declare namespace Model {

	interface Param {
		id: string
		token: string
		minStake: string
		frozen: string
	}

	interface Creator {
		id: string
		product: Product
		address: string
		txHash: string
		timestamp: string
	}

	interface Merchant {
		id: string
		address: string
		uri: string
		stake: string
		stakeTimestamp: string
		productList: Product[]
		txHash: string
		timestamp: string
	}

	interface Product {
		id: string
		category: string
		uri: string
		price: string
		supply: string
		merchant: Merchant
		creator: Creator
	}

	interface ProductOwner {
		id: string
		owner: string
		product: Product
		amount: string
	}

	interface BuyRecord {
		id: string
		product: Product
		merchant: string
		payer: string
		to: string
		amount: string
		value: string
		txHash: string
		timestamp: string
	}

	interface Transfer {
		id: string
		product: Product
		from: string
		to: string
		amount: string
		txHash: string
		timestamp: string
	}

}