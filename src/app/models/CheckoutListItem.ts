import { Product } from "./Product";

export class CheckoutListItem {

    public totalPrice: number = 0;
    public totalBuyPrice: number = 0;

    constructor(
        public product: Product,
        public quantity: number = 1,
        public useSecondaryPrice: boolean = false
    ) {
        this.calculateTotalPrices()
    }

    public changeQuantity(changeAmount: number) {
        if (changeAmount == -1 && this.quantity == 1) {
            return
        }
        this.quantity += changeAmount
        this.calculateTotalPrices()
    }

    public calculateTotalPrices() {
        this.totalBuyPrice = this.quantity * this.product.buyPrice
        if (this.useSecondaryPrice) {
            this.totalPrice = this.quantity * this.product.secondSellPrice
        } else {
            this.totalPrice = this.quantity * this.product.sellPrice
        }
    }
}