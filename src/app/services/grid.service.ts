import { Injectable } from '@angular/core';
import { readTextFile, createDir, readBinaryFile, writeBinaryFile, BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog';
import { AlertifyService } from './alertify.service';
import { Product } from '../models/product';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class GridService {

  constructor() { }

  currentGridItemList: Array<number> = [];


  async getGridItemsFromFile(): Promise<Array<number>> {
    try {
      const string = await readTextFile('SellApp\\gridItems.txt', { dir: BaseDirectory.Document });
      console.log(string)
      return JSON.parse(string);

    } catch (error) {
      await createDir("SellApp", { dir: BaseDirectory.Document })
      return [];
    }
  }


  async getGridItemList(): Promise<Array<number>> {
    if (this.currentGridItemList.length == 0) {
      this.currentGridItemList = await this.getGridItemsFromFile();
      return this.currentGridItemList;
    }
    return this.currentGridItemList;
  }


  async getImageByBarcode(barcode: number): Promise<Uint8Array> {
    const binary = await readBinaryFile(`SellApp\\Images\\${barcode}.png`, { dir: BaseDirectory.Document })

    return binary
  }

  async selectImage(productBarcode: number) {
    try {

      const selectedImage = await open({
        multiple: false,
        title: 'Ürün Görseli Seçin',
        filters: [{
          name: "Image",
          extensions: ["jpg", "jpeg", "png"]
        }]
      })


      if (selectedImage == null || Array.isArray(selectedImage)) {
        new AlertifyService().showAlert("Görsel Seçilmedi", 2);
      } else {
        var binaryFile = await readBinaryFile(selectedImage)
        console.log(binaryFile);
        await this.addToImages(binaryFile, productBarcode);
      }

    } catch (error) {
      console.error(error);

    }
  }

  async addToImages(binary: Uint8Array, productBarcode: number) {
    try {
      await writeBinaryFile(`SellApp\\Images\\${productBarcode}.png`, binary, { dir: BaseDirectory.Document });

    } catch (error) {
      await createDir('SellApp\\Images', { dir: BaseDirectory.Document })
      this.addToImages(binary, productBarcode)
      console.error(error);
    }
  }

  async addNewGridItem(productBarcode: number) {
    const products = await this.getGridItemList();

    const isContains = products.find(n => n == productBarcode);

    if (isContains == undefined) {
      products.push(productBarcode);
      this.writeGridListToFile(products)
    } else {
      new AlertifyService().showAlert("Ürün Tabloda Bulunuyor", 3);
    }
  }

  async removeFromGridList(barcode: number) {
    const gridList = await this.getGridItemList();

    const newList = gridList.filter(n => n != barcode);

    await this.writeGridListToFile(newList);
  }

  async writeGridListToFile(products: Array<number>) {
    try {
      const string = JSON.stringify(products);
      await writeTextFile('SellApp\\gridItems.txt', string, { dir: BaseDirectory.Document })
      this.currentGridItemList = await this.getGridItemsFromFile();
    } catch (error) {
      console.error(error);
    }

  }
}
