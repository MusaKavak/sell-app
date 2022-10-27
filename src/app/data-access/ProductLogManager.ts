import { ProductLogItem } from '../models/ProductLogItem';
import { Product } from '../models/Product';
import { FileManager } from './FileManager';

export class ProductLogManager {
  newUpdateProductLog(product: Product, productAfter: Product) {
    this.addNewLog(new ProductLogItem(
      "Ürün Güncellendi",
      "updatedProduct",
      product,
      new Date().toISOString(),
      productAfter
    ))
  }

  newDeleteProductLog(product: Product) {
    this.addNewLog(new ProductLogItem(
      "Ürün Silindi",
      "deletedProduct",
      product,
      new Date().toISOString()
    ))
  }

  newNewProductLog(product: Product) {
    this.addNewLog(new ProductLogItem(
      "Yeni Ürün Eklendi",
      "newProduct",
      product,
      new Date().toISOString(),
      undefined,
      (product.stockAmount * product.buyPrice),
      product.stockAmount
    ))
  }

  newAddStockLog(product: Product, newStockAmount: number) {
    this.addNewLog(
      new ProductLogItem(
        "Stok Eklendi",
        "addedStock",
        product,
        new Date().toISOString(),
        undefined,
        (product.buyPrice * newStockAmount),
        newStockAmount
      ))

  }

  async getLogs(): Promise<Array<ProductLogItem>> {
    const deleteLogsOlderThanDays = 10
    const logs = await FileManager.getListFromDocuments<ProductLogItem>(FileManager.filePaths.productLogs)
    const shouldNewerThan = new Date(new Date().getTime() - (deleteLogsOlderThanDays * 86400000)).toISOString()

    const newLogs = logs.filter(l => l.date > shouldNewerThan)
    this.writeLogsToFile(newLogs)
    return newLogs
  }

  async addNewLog(log: ProductLogItem) {
    const logs = await this.getLogs()
    logs.push(log);
    await this.writeLogsToFile(logs);
  }

  async writeLogsToFile(logs: Array<ProductLogItem>) {
    await FileManager.writeListIntoDocuments<ProductLogItem>("productLogs.txt", logs)
  }
}
