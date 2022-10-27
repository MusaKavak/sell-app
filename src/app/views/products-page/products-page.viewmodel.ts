import { ImageManager } from "src/app/data-access/ImageManager";
import { ProductLogManager } from "src/app/data-access/ProductLogManager";
import { ProductManager } from "src/app/data-access/ProductManager";
import { Product } from "src/app/models/Product";
import { ProductLogItem } from "src/app/models/ProductLogItem";
import { AlertifyService } from "src/app/services/alertify.service";
import { StatusCodes } from "src/app/StatusCodes";

export class ProductPageViewmodel {

    productManager = new ProductManager()
    productLogManager = new ProductLogManager()
    imageManager = new ImageManager()

    constructor(
        private alertify: AlertifyService
    ) { }


    async getProducts(): Promise<Product[]> {
        return await this.productManager.getProducts()
    }

    async getProductLogs(): Promise<ProductLogItem[]> {
        return (await this.productLogManager.getLogs()).reverse()
    }

    async addNewProduct(product: Product): Promise<StatusCodes> {
        const response = await this.productManager.addNewProduct(product)
        if (response == StatusCodes.ALREADY_EXIST) {
            this.alertify.error("Ürün Zaten Bulunuyor: " + product.productName)
            return StatusCodes.ALREADY_EXIST
        }
        else if (response == StatusCodes.SUCCESS) {
            this.productLogManager.newNewProductLog(product)
            this.alertify.success("Yeni Ürün Eklendi: " + product.productName)
            return StatusCodes.SUCCESS
        } else {
            this.alertify.error("Bir Hata Oluştu")
            return StatusCodes.FAIL
        }
    }

    async updateProduct(product: Product): Promise<StatusCodes> {
        const response = await this.productManager.updateProduct(product)
        if (response.status == StatusCodes.NOT_FOUND) {
            this.alertify.error("Ürün Bulunamadı: " + product.productName)
            return StatusCodes.NOT_FOUND
        }
        else if (response.status == StatusCodes.UPDATED) {
            this.productLogManager.newUpdateProductLog(response.productBefore!!, response.productAfter!!)
            this.alertify.success(
                "Ürün Güncellendi: " +
                response.productBefore?.productName +
                " -> " +
                response.productAfter?.productName)
            return StatusCodes.SUCCESS
        } else {
            this.alertify.error("Bir Hata Oluştu")
            return StatusCodes.FAIL
        }
    }

    async adjustStockAmount(product: Product, changeAmount: number): Promise<StatusCodes> {
        const response = await this.productManager.changeStockAmountByBarcode(product.barcode, changeAmount)
        if (response == StatusCodes.NOT_FOUND) {
            this.alertify.error("Ürün Bulunamadı: " + product.productName)
            return StatusCodes.NOT_FOUND
        }
        else if (response == StatusCodes.SUCCESS) {
            this.productLogManager.newAddStockLog(product, changeAmount)
            this.alertify.success("Stok Eklendi: " + product.productName)
            return StatusCodes.SUCCESS
        } else {
            this.alertify.error("Bir Hata Oluştu")
            return StatusCodes.FAIL
        }
    }

    async deleteProduct(product: Product): Promise<StatusCodes> {
        const response = await this.productManager.deleteProduct(product)
        if (response == StatusCodes.SUCCESS) {
            this.productLogManager.newDeleteProductLog(product)
            this.alertify.success("Ürün Silindi: " + product.productName)
            return StatusCodes.SUCCESS
        } else {
            this.alertify.error("Bir Hata Oluştu")
            return StatusCodes.FAIL
        }
    }

    async getImageBitmap(barcode: number): Promise<{ status: StatusCodes, imgSrc: string | null }> {
        const string = await this.imageManager.getBase64WithBarcode(barcode)
        if (string != undefined) {
            return {
                status: StatusCodes.SUCCESS,
                imgSrc: "data:image/png;base64," + string
            }
        } else {
            return {
                status: StatusCodes.NOT_FOUND,
                imgSrc: null
            }
        }
    }
    async selectImageByBarcode(barcode: number): Promise<StatusCodes> {
        const status = await this.imageManager.selectImageByBarcode(barcode)
        switch (status) {
            case StatusCodes.NOT_SELECTED:
                this.alertify.error("Görsel Seçilmedi!")
                break
            case StatusCodes.NOT_FOUND:
                this.alertify.error("Görsel Bulunamadı!")
                break;
            case StatusCodes.SUCCESS:
                this.alertify.success("Görsel Seçildi!")
                break;
            case StatusCodes.FAIL:
                this.alertify.error("Bir Hata Oluştu");
        }
        return status
    }
}