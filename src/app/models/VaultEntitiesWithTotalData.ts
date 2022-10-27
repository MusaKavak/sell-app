import { VaultEntity } from "./VaultEntity";

export class VaultEntitiesWithTotalData {
    constructor(
        public vaultEntities: Array<VaultEntity>,
        public totalSellPrice: number,
        public totalBuyPrice: number,
        public totalCountOfSelledProducts: number,
        public totalValueOfCashSales: number,
        public totalValueOfCreditSales: number
    ) { }
}