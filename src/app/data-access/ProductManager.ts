import { Product } from 'src/app/models/Product';
import { VaultEntity } from '../models/VaultEntity';
import { StatusCodes } from '../StatusCodes';
import { FileManager } from './FileManager';

export class ProductManager {
  static cache: Product[] = []

  async getProducts(): Promise<Product[]> {
    if (ProductManager.cache.length <= 0) {
      ProductManager.cache = (await FileManager.getListFromDocuments<Product>(FileManager.filePaths.products)).sort((a, b) => {
        return a.barcode - b.barcode
      })
    }
    return ProductManager.cache
  }

  async getByBarcode(barcode: number): Promise<Product | undefined> {
    const products = await this.getProducts();
    const product = products.find(p => p.barcode == barcode);
    if (product == undefined) {
      return undefined
    } else {
      return product
    }
  }

  async addNewProduct(product: Product): Promise<StatusCodes> {
    const products = await this.getProducts();
    const isContains = products.find(p => p.barcode == product.barcode);
    if (isContains == undefined) {
      products.push(product);
      return await this.writeToFile(products);
    } else {
      return StatusCodes.ALREADY_EXIST
    }
  }

  async updateProduct(productAfter: Product): Promise<{ status: StatusCodes, productBefore: Product | null, productAfter: Product | null }> {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.barcode == productAfter.barcode);
    if (index == -1) {
      return { status: StatusCodes.NOT_FOUND, productBefore: null, productAfter: null }
    } else {
      const productBefore = products[index]
      products[index] = productAfter;
      const status = await this.writeToFile(products);
      return status ? { status: StatusCodes.UPDATED, productBefore, productAfter }
        : { status: StatusCodes.FAIL, productBefore: null, productAfter: null }
    }
  }

  async changeStockAmountByList(vaultEntity: VaultEntity, multiplier: number): Promise<StatusCodes> {
    const products = await this.getProducts()
    for (const item of vaultEntity.checkList) {
      const productToUpdate = products.findIndex(p => p.barcode == item.product.barcode)
      products[productToUpdate].stockAmount += (multiplier * item.quantity)
    }
    return await this.writeToFile(products)
  }

  async changeStockAmountByBarcode(barcode: number, changeAmount: number): Promise<StatusCodes> {
    const products = await this.getProducts()
    const productIndexToChange = products.findIndex(p => p.barcode == barcode)
    if (productIndexToChange == -1) {
      return StatusCodes.NOT_FOUND
    } else {
      products[productIndexToChange].stockAmount += changeAmount
      return await this.writeToFile(products)
    }
  }

  async deleteProduct(product: Product): Promise<StatusCodes> {
    const products = await this.getProducts();
    const newList = products.filter(c => c.barcode != product.barcode);
    return await this.writeToFile(newList);
  }

  async writeToFile(list: Product[]): Promise<StatusCodes> {
    ProductManager.cache = []
    await FileManager.writeListIntoDocuments<Product>(FileManager.filePaths.products, list)
    return StatusCodes.SUCCESS
  }
}
