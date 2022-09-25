import { Product } from "./product";

export class LogItem {
    constructor(
        public info: String,
        public boxType: String,
        public product: Product,
        public date: Date,
        public productAfter?: Product,
        public transactionPrice?: number,
        public stockEntryAmount?: number,
    ) {
    }
}