import { Product } from "./product";

export class CheckItem {

    public totalPrice: number = 0;
    public totalBuyPrice: number = 0;


    constructor(
        public barcode: number,
        public itemCount: number = 1,
        public singleBuyPrice: number,
        public singlePrice: number,
        public productName: string,
        public secondSinglePrice?: number
    ) {
    }

    public changeItemCount(number: number, currentAmount: number) {
        if (number == -1 && currentAmount == 1) {
            return
        }
        this.itemCount += number
    }

    public getTotalPrice(isSecondPrice: boolean): number {
        if (isSecondPrice && this.secondSinglePrice != null) {
            this.totalPrice = this.itemCount * this.secondSinglePrice
        } else {
            this.totalPrice = this.itemCount * this.singlePrice
        }

        this.totalBuyPrice = this.singlePrice * this.singleBuyPrice;

        return this.totalPrice;
    }
}