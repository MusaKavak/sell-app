import { VaultEntity } from "./vaultEntity";

export class VaultServiceResponse {
    constructor(
        public vaultEntityList: Array<VaultEntity>,
        public allMoney: number,
        public allBuyPrice: number,
        public payCashCount: number,
        public onCreditCount: number,
        public totalItemCount: number,
        public allMoneyWithoutCredits: number,
        public onCreditSaleList: Array<number>
    ) { }
}