import { Injectable } from '@angular/core';
import { VaultEntity } from '../models/vaultEntity';
import { readTextFile, createDir, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { VaultService } from './vault.service';
import { getVaultFileName, getVaultPathDesign } from '../tools/dateTool';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'any'
})
export class CheckOutService {

  currentDateString = "";
  currentDaysFilePath = "";

  constructor() {
    this.currentDateString = getVaultFileName();
    this.currentDaysFilePath = getVaultPathDesign(this.currentDateString);
  }

  currentDaysVault: Array<VaultEntity> = [];

  async getCurrentDaysFile(): Promise<Array<VaultEntity>> {
    try {
      const string = await readTextFile(this.currentDaysFilePath, { dir: BaseDirectory.Document })
      return JSON.parse(string);
    } catch (error) {
      await createDir("SellApp\\Vault\\" + this.currentDateString + "\\", { dir: BaseDirectory.Document })
      const vaultService = new VaultService()
      const days = await vaultService.getDayList();
      days.push(this.currentDateString)
      await writeTextFile("SellApp\\Vault\\dayList.txt", JSON.stringify(days), { dir: BaseDirectory.Document })
      return [];
    }
  }

  async getCurrentDaysVaultEntities(): Promise<Array<VaultEntity>> {
    if (this.currentDaysVault.length == 0) {
      this.currentDaysVault = await this.getCurrentDaysFile();
      return this.currentDaysVault;
    }
    return this.currentDaysVault;
  }

  async writeToFile(list: Array<VaultEntity>) {
    const string = JSON.stringify(list);
    await writeTextFile(this.currentDaysFilePath, string, { dir: BaseDirectory.Document });
  }

  async updateList() {
    const string = await readTextFile(this.currentDaysFilePath, { dir: BaseDirectory.Document })
    this.currentDaysVault = JSON.parse(string);
  }

  async checkOut(checkOut: VaultEntity): Promise<Boolean> {
    try {
      const entities = await this.getCurrentDaysVaultEntities();
      if (checkOut.customer != undefined) {
        const customerService = new CustomerService();
        await customerService.incDcrCredit(checkOut.customer.id, checkOut.totalPrice);
      }
      entities.push(checkOut);
      await this.writeToFile(entities);
      await this.updateList();
      return true;
    } catch (error) {
      console.error(error)
      return false;
    }
  }
}
