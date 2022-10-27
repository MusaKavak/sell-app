import { CheckoutListItem } from "./CheckoutListItem";
import { Customer } from "./Customer";

export class VaultEntity {
    constructor(
        public date: Date,
        public checkList: Array<CheckoutListItem>,
        public totalPrice: number,
        public totalBuyPrice: number,
        public useSecondPrice: boolean,
        public isCash: boolean,
        public customer?: Customer,
    ) { }
}