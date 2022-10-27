import { CustomerManager } from "src/app/data-access/CustomerManager";
import { ProductManager } from "src/app/data-access/ProductManager";
import { VaultManager } from "src/app/data-access/VaultManager";
import { VaultEntitiesWithTotalData } from "src/app/models/VaultEntitiesWithTotalData";
import { VaultEntity } from "src/app/models/VaultEntity";

export class VaultPageViewModel {
    vaultManager = new VaultManager
    productManager = new ProductManager
    customerManager = new CustomerManager


    async getAvailableDays(): Promise<string[]> {
        return await this.vaultManager.getAvailableDays()
    }

    async getVaultEntitiesByDayName(date: string): Promise<VaultEntitiesWithTotalData> {
        const entities = await this.vaultManager.getVaultFileByDateName(date)
        return this.calculateVaultInfo(entities)
    }

    calculateVaultInfo(entities: Array<VaultEntity>): VaultEntitiesWithTotalData {
        const data = new VaultEntitiesWithTotalData(
            entities, 0, 0, 0, 0, 0
        )
        for (const entity of entities) {
            data.totalSellPrice += entity.totalPrice;
            data.totalBuyPrice += entity.totalBuyPrice;
            data.totalCountOfSelledProducts++;
            if (entity.isCash) {
                data.totalValueOfCashSales += entity.totalPrice
            } else {
                data.totalValueOfCreditSales += entity.totalPrice
            }
        };
        return data
    }

    async removeVaultEntity(entity: VaultEntity, fileName: string) {
        await this.vaultManager.removeVaultEntity(entity, fileName)
        await this.productManager.changeStockAmountByList(entity, 1)
        if (entity.customer != undefined) {
            await this.customerManager.changeCustomerCredit(entity.customer!!, -entity.totalPrice)
        }
    }
}