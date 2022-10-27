import { CustomerManager } from "src/app/data-access/CustomerManager";
import { ImageManager } from "src/app/data-access/ImageManager";
import { ProductManager } from "src/app/data-access/ProductManager";
import { VaultManager } from "src/app/data-access/VaultManager";
import { CheckoutListItem } from "src/app/models/CheckoutListItem";
import { Customer } from "src/app/models/Customer";
import { Product } from "src/app/models/Product";
import { VaultEntity } from "src/app/models/VaultEntity";
import { AlertifyService } from "src/app/services/alertify.service";

export class CheckPageViewmodel {
    customerManager = new CustomerManager()
    productManager = new ProductManager()
    vaultManager = new VaultManager()
    imageManager = new ImageManager()

    constructor(
        private alertifyService: AlertifyService
    ) { }

    ///////////////////////////////////////Second Price Preference
    getUseSecondPriceState(): boolean {
        var data = localStorage.getItem("isSecondPrice");
        return "true" == data
    }

    setSecondPricePreferece(newValue: boolean) {
        localStorage.setItem("isSecondPrice", newValue.toString())
    }
    ///////////////////////////////////////Lists

    async getCustomerList(): Promise<Customer[]> {
        return await this.customerManager.getCustomers()
    }
    async getProductList(): Promise<Product[]> {
        return await this.productManager.getProducts()
    }
    ///////////////////////////////////////Checkout
    async checkOutOnCredit(checkoutEntity: VaultEntity) {
        this.customerManager.changeCustomerCredit(checkoutEntity.customer!!, checkoutEntity.totalPrice);
        this.vaultManager.newVaultItem(checkoutEntity)
        await this.productManager.changeStockAmountByList(checkoutEntity, -1)
        this.controlStockAmount(checkoutEntity.checkList)
    }

    async checkOutWithCash(checkoutEntity: VaultEntity) {
        this.vaultManager.newVaultItem(checkoutEntity)
        this.controlStockAmount(checkoutEntity.checkList)
        await this.productManager.changeStockAmountByList(checkoutEntity, -1)
    }

    controlStockAmount(checkoutList: CheckoutListItem[]) {
        const lowStockAlertBorder = 3
        for (const item of checkoutList) {
            if (item.product.stockAmount - item.quantity < lowStockAlertBorder) {
                this.alertifyService.error("Düşük Ürün Sayısı: " + item.product.productName)
            }
        }
    }

    ///////////////////////////////////////Product Image
    async getProductImageBybarcode(barcode: number): Promise<string | undefined> {
        const string = await this.imageManager.getBase64WithBarcode(barcode)
        if (string != undefined) {
            return "data:image/png;base64," + string
        } else {
            return undefined
        }
    }
}