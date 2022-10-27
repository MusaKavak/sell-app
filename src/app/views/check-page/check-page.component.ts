import { Component, Input, OnInit } from '@angular/core';
import { CheckoutListItem } from 'src/app/models/CheckoutListItem';
import { Customer } from 'src/app/models/Customer';
import { Product } from 'src/app/models/Product';
import { VaultEntity } from 'src/app/models/VaultEntity';
import { AlertifyService } from 'src/app/services/alertify.service';
import { CheckPageViewmodel } from './check-page.viewmodel';

@Component({
  selector: 'app-check-page',
  templateUrl: './check-page.component.html',
  styleUrls: ['./check-page-layout.css', './check-page-barcode-container.css', './check-page-table.css', './check-page-checkout.css', './check-page-customer.css', './check-page-grid.css']
})
export class CheckPageComponent implements OnInit {
  viewmodel: CheckPageViewmodel = new CheckPageViewmodel(this.alertifyService)

  @Input()
  set ready(isReady: boolean) {
    if (isReady) {
      this.setGridImages()
    }
  }

  //NgModel
  itemCountInputValue = 1;
  useSecondPrice = false;

  //Lists
  customers: Customer[] = []
  products: Product[] = []
  checkoutList: Array<CheckoutListItem> = [];
  gridItems: { product: Product, imgSrc: string | undefined }[] = []

  //Variables
  totalPrice: number = 0;
  totalBuyPrice: number = 0;
  totalItemCount = 0;
  selectedCustomer?: Customer;
  isFocusedInput = false;

  //HTML Elements
  checkTableElement: HTMLElement | null = null

  constructor(
    private alertifyService: AlertifyService
  ) { }

  ngOnInit(): void {
    this.setLists()
    this.setDomElements()
  }
  async setLists() {
    if (this.viewmodel != undefined) {
      this.useSecondPrice = this.viewmodel.getUseSecondPriceState()
      this.customers = await this.viewmodel.getCustomerList()
      this.getProducts()
    }
  }
  async getProducts() {
    this.viewmodel!!.getProductList().then(products => {
      this.products = products
      this.gridItems = []
      for (const product of products) {
        if (product.addToGrid) this.gridItems.push({ product: product, imgSrc: "assets/icons/loading.gif" })
      }
      this.setGridImages()
    })
  }

  setDomElements() {
    window.onload = () => {
      this.checkTableElement = document.getElementById("check-table")
    }
  }

  setUseSecondPriceState() {
    this.useSecondPrice = !this.useSecondPrice
    for (const item of this.checkoutList) {
      item.useSecondaryPrice = this.useSecondPrice
      item.calculateTotalPrices()
    }
    this.setTotalValues()
    this.viewmodel?.setSecondPricePreferece(this.useSecondPrice)
  }

  focusToBarcodeInput(input: HTMLElement) {
    if (!this.isFocusedInput) {
      input.focus();
    } else {
      this.isFocusedInput = false;
    }
  }

  submitBarcodeInput(inputElement: HTMLInputElement) {
    if (inputElement.value != undefined) {
      const barcode = parseInt(inputElement.value)
      if (!isNaN(barcode)) {
        this.addCheckItemByBarcode(barcode)
        inputElement.value = ""
      }
    }
  }

  addCheckItemByBarcode(barcode: number) {
    const productToAdd = this.products.find(p => p.barcode == barcode)
    if (productToAdd != undefined) {
      this.addItemToCheck(productToAdd)
    } else {
      this.alertifyService.warning("Ürün Bulunamadı")
    }
  }

  addItemToCheck(product: Product, customItemAmount: number | null = null) {
    if (customItemAmount != null) {
      this.itemCountInputValue = customItemAmount
    }
    const productIndexInCheckItems = this.checkoutList.findIndex(c => c.product.barcode == product.barcode)
    if (productIndexInCheckItems == -1) {
      this.checkoutList.push(new CheckoutListItem(
        product,
        this.itemCountInputValue,
        this.useSecondPrice
      ))
      if (this.checkoutList.length > 4) this.checkTableElement?.scrollTo({
        top: 5000,
        "behavior": "smooth"
      })
    } else {
      this.checkoutList[productIndexInCheckItems].changeQuantity(this.itemCountInputValue)
    }
    this.setTotalValues()
    this.itemCountInputValue = 1
  }

  removeItem(item: CheckoutListItem) {
    this.checkoutList = this.checkoutList.filter(c => c != item)
    this.setTotalValues()
  }

  copyBarcodeToClipboard(barcode: number, element: HTMLElement) {
    navigator.clipboard.writeText(barcode.toString()).then(() => {
      element.classList.add('active');
      setTimeout(() => {
        element.classList.remove('active');
      }, 2000);
    })
  }

  setTotalValues() {
    var price = 0
    var buyPrice = 0
    var itemCount = 0
    for (const item of this.checkoutList) {
      price += item.totalPrice
      buyPrice += item.totalBuyPrice
      itemCount += item.quantity;
    }
    this.totalPrice = price;
    this.totalBuyPrice = buyPrice;
    this.totalItemCount = itemCount;
  }

  cleanCheckItems() {
    this.checkoutList = [];
    this.selectedCustomer = undefined
    this.setTotalValues();
  }

  checkOutWithCredit() {
    if (this.checkoutList.length > 0 && this.selectedCustomer != undefined) {
      this.viewmodel?.checkOutOnCredit(new VaultEntity(
        new Date,
        this.checkoutList,
        this.totalPrice,
        this.totalBuyPrice,
        this.useSecondPrice,
        false,
        this.selectedCustomer
      )).then(() => {
        this.getProducts()
        this.cleanCheckItems()
      })
    }
  }

  checkOutWithCash() {
    if (this.checkoutList.length > 0) {
      this.viewmodel?.checkOutWithCash(new VaultEntity(
        new Date,
        this.checkoutList,
        this.totalPrice,
        this.totalBuyPrice,
        this.useSecondPrice,
        true
      )).then(() => {
        this.getProducts()
        this.cleanCheckItems()
      })
    }
  }

  setGridImages() {
    for (const item of this.gridItems) {
      this.getProductImage(item.product.barcode).then(str => item.imgSrc = str)
    }
  }

  async getProductImage(barcode: number): Promise<string | undefined> {
    return this.viewmodel?.getProductImageBybarcode(barcode).then()
  }
}
