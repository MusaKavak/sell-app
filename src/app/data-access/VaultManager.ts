import { VaultEntity } from '../models/VaultEntity';
import { StatusCodes } from '../StatusCodes';
import { getVaultFileName, getVaultPathDesign } from '../tools/dateTool';
import { FileManager } from './FileManager';

export class VaultManager {

  static cache: VaultEntity[] = []
  static currentCacheDate: string = ""

  async getVaultFileByDateName(fileName: string): Promise<Array<VaultEntity>> {
    if (VaultManager.currentCacheDate == fileName && VaultManager.cache.length <= 0) {
      return VaultManager.cache
    } else {
      VaultManager.cache = await FileManager.getListFromDocuments<VaultEntity>(getVaultPathDesign(fileName))
      VaultManager.currentCacheDate = fileName
      return VaultManager.cache
    }
  }

  async removeVaultEntity(vaultEntity: VaultEntity, fileName: string): Promise<StatusCodes> {
    const list = await this.getVaultFileByDateName(fileName);
    const newList = list.filter(ve => ve.date != vaultEntity.date)
    return await this.writeToFile(newList, fileName)
  }

  async newVaultItem(entity: VaultEntity) {
    const todaysFileName = getVaultFileName(entity.date)
    const todaysVaultEntityList = await this.getVaultFileByDateName(todaysFileName)
    todaysVaultEntityList.push(entity)
    this.writeToFile(todaysVaultEntityList, todaysFileName)
  }

  async getAvailableDays() {
    const days = await FileManager.getListFromDocuments<string>(FileManager.filePaths.dayListOfVaults)
    const todaysFileName = getVaultFileName(new Date())
    if (days.find(x => x == todaysFileName) == undefined) {
      days.push(todaysFileName)
      this.writeAvailableDaysFile(days)
    }
    return days.reverse()
  }

  async writeAvailableDaysFile(days: string[]) {
    await FileManager.writeListIntoDocuments<string>(FileManager.filePaths.dayListOfVaults, days)
  }

  async writeToFile(list: Array<VaultEntity>, fileName: string): Promise<StatusCodes> {
    VaultManager.cache = []
    VaultManager.currentCacheDate = ""
    const status = await FileManager.writeListIntoDocuments<VaultEntity>(getVaultPathDesign(fileName), list)
    return status ? StatusCodes.SUCCESS : StatusCodes.FAIL
  }
}
