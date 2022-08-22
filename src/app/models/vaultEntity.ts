import { CheckItem } from "./checkItem";
import { Customer } from "./customer";

export class VaultEntity {
    constructor(
        public date: Date,
        public checkList: Array<CheckItem>,
        public totalPrice: number,
        public totalBuyPrice: number,
        public isSecondPrice: boolean,
        public isCash: boolean,
        public customer?: Customer,
    ) { }
}