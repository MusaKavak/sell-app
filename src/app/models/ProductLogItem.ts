import { Product } from "./Product";

export class ProductLogItem {
    constructor(
        public info: string,
        public boxType: string,
        public product: Product,
        public date: string,
        public productAfter?: Product,
        public transactionPrice?: number,
        public stockEntryAmount?: number,
    ) {
    }
}