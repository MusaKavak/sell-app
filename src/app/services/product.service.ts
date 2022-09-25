import { Injectable } from '@angular/core';
import { Product } from 'src/app/models/product';
import { readTextFile, createDir, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { AlertifyService } from './alertify.service';
import { GridService } from './grid.service';
import { LogService } from './log.service';
import { LogItem } from '../models/LogItem';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  currentProductList: Array<Product> = [];
  logService: LogService = new LogService();
  constructor() {

  }

  private async getProductsFromFile(): Promise<Array<Product>> {
    try {
      const string = await readTextFile("SellApp\\products.txt", { dir: BaseDirectory.Document })
      return JSON.parse(string);
    } catch (err) {
      return [];
    }
  }

  async getProducts(): Promise<Array<Product>> {
    if (this.currentProductList?.length == 0) {
      this.currentProductList = await this.getProductsFromFile();
      return this.currentProductList.sort((a, b) => {
        return a.barcode! - b.barcode!;
      });
    }
    return this.currentProductList.sort((a, b) => {
      return a.barcode! - b.barcode!;
    });
  }


  async addNewProduct(product: Product): Promise<Boolean> {
    const products = await this.getProducts();

    const isContains = products.find(p => p.barcode == product.barcode);

    if (isContains == undefined) {
      products.push(product);
      await this.writeProductsToFile(products);
      await this.updateList();
      await this.logService.addNewLog(new LogItem(
        "Yeni Ürün Eklendi",
        "newProduct",
        product,
        new Date(),
        undefined,
        (product.stockAmount * product.buyPrice),
        product.stockAmount
      ))
      return true;
    } else {
      return false;
    }
  }

  async updateProduct(product: Product) {
    const products = await this.getProducts();

    const index = products.findIndex(p => p.barcode == product.barcode);

    if (index == -1) {
      new AlertifyService().showAlert('Ürün Bulunamadı', 2)
    } else {
      const productToLog = products[index]
      products[index] = product;
      await this.writeProductsToFile(products);
      await this.updateList();
      await this.logService.addNewLog(new LogItem(
        "Ürün Güncellendi",
        "updatedProduct",
        productToLog,
        new Date(),
        product
      ))
    }
  }

  async updateList() {
    var string = await readTextFile('SellApp\\products.txt', { dir: BaseDirectory.Document })

    if (string.length > 0) {
      this.currentProductList = JSON.parse(string)
    } else {
      this.updateList()
    }
  }

  async getProductByBarcode(barcode: Number): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find(p => p.barcode == barcode);
  }

  async writeProductsToFile(products: Array<Product>) {
    const string = JSON.stringify(products);
    try {
      await writeTextFile('SellApp\\products.txt', string, { dir: BaseDirectory.Document, });

    } catch (error) {
      console.log(error);
      await createDir("SellApp", { dir: BaseDirectory.Document })
      this.writeProductsToFile(products)
    }

  }

  async changeStockAmount(productBarcode: number, stockChange: number) {

    try {
      const products = await this.getProducts();
      var index = 0;

      var productForChange = products.find((p, i) => {
        if (p.barcode == productBarcode) {
          index = i;
          return true;
        }
        return false;
      });

      if (productForChange != undefined) {
        products[index].stockAmount! += stockChange;

        if (products[index].stockAmount! < 3) {
          if (stockChange < 0) {
            new AlertifyService().showAlert(`Düşük Ürün Sayısı: ${productForChange.productName}`, 2)
          }
        }

        await this.writeProductsToFile(products);
        await this.updateList();

      }

    } catch (err) {
      console.error(err);
    }

  }

  addStockLog(product: Product, newStockAmount: number) {
    console.log(product)
    this.logService.addNewLog(new LogItem(
      "Stok Eklendi",
      "addedStock",
      product,
      new Date(),
      undefined,
      (product.buyPrice * newStockAmount),
      newStockAmount
    ))
  }

  async deleteProduct(product: Product) {
    const products = await this.getProducts();

    const newList = products.filter(p => p.barcode != product.barcode);

    const gridService = new GridService();
    await gridService.removeFromGridList(product.barcode);

    await this.writeProductsToFile(newList);
    await this.updateList();
    await this.logService.addNewLog(new LogItem(
      "Ürün Silindi",
      "deletedProduct",
      product,
      new Date()
    ))
  }

}
