import { Injectable } from '@angular/core';
import { readTextFile, createDir, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { VaultEntity } from '../models/vaultEntity';
import { VaultServiceResponse } from '../models/vaultServiceResponse';
import { getVaultFileName, getVaultPathDesign } from '../tools/dateTool';
import { CustomerService } from './customer.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'any'
})
export class VaultService {

  currentDayFileName = "";
  currentDayFilePath = "";
  currentVault: Array<VaultEntity> = [];

  constructor() {
    this.currentDayFileName = getVaultFileName();
    this.currentDayFilePath = getVaultPathDesign(this.currentDayFileName)
  }

  async getVaultFile(fileName: string): Promise<Array<VaultEntity>> {
    try {
      const string = await readTextFile(getVaultPathDesign(fileName), { dir: BaseDirectory.Document })
      return JSON.parse(string)
    } catch (error) {
      return [];
    }
  }

  async getVaultInfo(fileName: string = this.currentDayFileName): Promise<VaultServiceResponse> {
    const list = await this.getVaultFile(fileName);

    return await this.calculateVaultInfo(list)
  }

  async calculateVaultInfo(list: Array<VaultEntity>): Promise<VaultServiceResponse> {

    var price = 0;
    var buyPrice = 0;
    var cash = 0;
    var onCredit = 0;
    var itemCount = 0;
    var onCreditSaleList: Array<number> = []
    var noCreditMoney = 0;

    list.forEach((ve, i) => {
      price += ve.totalPrice;
      buyPrice += ve.totalBuyPrice;
      if (ve.isCash) {
        noCreditMoney += ve.totalPrice;
        cash++
      } else {
        onCreditSaleList.push(i)
        onCredit++;
      }

      itemCount++;
    });

    return {
      vaultEntityList: list,
      allMoney: price,
      allBuyPrice: buyPrice,
      payCashCount: cash,
      onCreditCount: onCredit,
      totalItemCount: itemCount,
      allMoneyWithoutCredits: noCreditMoney,
      onCreditSaleList: onCreditSaleList
    }
  }

  async removeVaultEntity(vaultEntity: VaultEntity, fileName: string = this.currentDayFileName) {
    const list = await this.getVaultFile(fileName);

    const productService = new ProductService;

    vaultEntity.checkList.forEach(async (item) => {
      await productService.changeStockAmount(item.barcode, item.itemCount)
    })

    if (vaultEntity.customer != undefined) {
      const customerService = new CustomerService();
      await customerService.incDcrCredit(vaultEntity.customer.id, -vaultEntity.totalPrice)
    }

    const newList = list.filter(ve => ve.date != vaultEntity.date)

    await this.writeToFile(newList, fileName)
  }

  async writeToFile(list: Array<VaultEntity>, fileName: string) {
    const string = JSON.stringify(list);
    await writeTextFile(getVaultPathDesign(fileName), string, { dir: BaseDirectory.Document });
  }

  async getDayList(): Promise<string[]> {
    try {
      const string = await readTextFile("SellApp\\Vault\\dayList.txt", { dir: BaseDirectory.Document });
      return JSON.parse(string);
    } catch (error) {
      return [];
    }
  }
}
