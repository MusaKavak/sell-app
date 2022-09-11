import { Component, OnInit } from '@angular/core';
import { CheckItem } from '../models/checkItem';
import { Customer } from '../models/customer';
import { GridItem } from '../models/gridItem';
import { Product } from '../models/product';
import { VaultEntity } from '../models/vaultEntity';
import { AlertifyService } from '../services/alertify.service';
import { CheckOutService } from '../services/check-out.service';
import { CustomerService } from '../services/customer.service';
import { GridService } from '../services/grid.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-check-page',
  templateUrl: './check-page.component.html',
  styleUrls: ['./check-page.component.css', './check-page-checkout.css', './check-page-customer.css', './check-page-grid.css'],
  providers: [ProductService, AlertifyService, CheckOutService, CustomerService]
})
export class CheckPageComponent implements OnInit {

  constructor(
    private productService: ProductService,
    private alertifyService: AlertifyService,
    private CheckOutService: CheckOutService,
    private customerService: CustomerService,
    private gridService: GridService,
  ) { }

  ngOnInit(): void {
    this.setListeners()
    this.getCustomers()
    this.setGridItemsList()
    this.controlLocalStorage()
  }

  //Variables
  itemAmount = 1;
  fileInputValue: any;
  totalPrice: number = 0;
  totalBuyPrice: number = 0;
  totalItemCount = 0;
  barcode?: number;
  selectedCustomer?: Customer;

  barcodeForAddNewGridItem?: number;
  isCustomerMenuOpen = false;
  isFocusedInput = false;
  isAddGridItemBoxOpen = false;
  isSecondPrice = false;
  isImageSelected = false;

  //Lists
  checkItems: Array<CheckItem> = [];
  customers: Array<Customer> = [];
  gridListItems: Array<Product> = [];

  setListeners() {
    setTimeout(() => {

      const barcode = document.getElementById("barcode")

      barcode?.addEventListener('keydown', (key) => {
        if (key.key == 'Enter') {
          this.productControl()
        }
      })

      document.body.addEventListener('click', () => {
        setTimeout(() => {

          if (!this.isFocusedInput) {
            barcode?.focus();
          } else {
            this.isFocusedInput = false;
          }
        }, 250);
      })
    }, 500);
  }

  controlLocalStorage() {
    var data = localStorage.getItem("isSecondPrice");
    if (data == "true") {
      this.isSecondPrice = true;
    }
    if (data == "false") {
      this.isSecondPrice = false;
    }
  }

  saveSecondPriceState() {
    setTimeout(() => {
      if (this.isSecondPrice) {
        localStorage.setItem("isSecondPrice", "true");
      } else {
        localStorage.setItem("isSecondPrice", "false");
      }
    }, 500);
  }

  setFocus() {
    this.isFocusedInput = true;
  }

  getCustomers() {
    this.customerService.getCustomers().then((customers) => {
      this.customers = customers;
    })
  }

  productControl() {
    if (this.barcode == undefined) {
      return
    }
    this.productService.getProductByBarcode(this.barcode).then((product) => {
      if (product == undefined) {
        this.alertifyService.showAlert("Ürün Bulunamadı", 3)
      } else {
        this.addItemToCheck(product)
      }
    })
    this.barcode = undefined;
  }

  addItemToCheck(product: Product) {
    var index = 0
    var isContains = this.checkItems.find((p, i) => {
      if (p.barcode == product.barcode) {
        index = i
        return true
      }
      return false
    }) != undefined;

    if (isContains) {
      this.checkItems[index].itemCount += this.itemAmount
    } else {
      this.checkItems.push(new CheckItem(
        product.barcode,
        this.itemAmount,
        product.buyPrice,
        product.sellPrice,
        product.productName,
        product.secondSellPrice
      ))
      if (this.checkItems.length > 4) {
        document.querySelector(".check-table")?.scrollTo({
          top: (this.checkItems.length - 1) * 60,
          "behavior": "smooth"
        })
      }
    }
    this.updateValues();
  }

  setItemAmount(number: number) {
    if (number == -1 && this.itemAmount == 1) {
      return
    }
    this.itemAmount += number;
    this.updateValues();
  }
  removeItem(item: CheckItem) {
    this.checkItems = this.checkItems.filter(c => c != item)
    this.updateValues();
  }

  copyBarcodeToClipboard(barcode?: number) {
    if (barcode != null) {
      navigator.clipboard.writeText(barcode.toString()).then(() => {
        const bubble = document.querySelector(`.brd${barcode}.copyBubble`)!;
        bubble.classList.add('copyBubbleActive');
        setTimeout(() => {
          bubble.classList.remove('copyBubbleActive');
        }, 2000);
      })
    }
  }

  updateValues(timeOut: number = 0) {
    this.saveSecondPriceState();
    setTimeout(() => {
      let price = 0;
      let buyPrice = 0;
      let itemCount = 0;

      if (this.isSecondPrice) {
        this.checkItems.forEach(item => {
          if (item.secondSinglePrice != undefined) {
            price += item.secondSinglePrice * item.itemCount;
          } else {
            price += item.singlePrice * item.itemCount;
          }

          buyPrice += item.singleBuyPrice * item.itemCount;
          itemCount += item.itemCount;
        });
      } else {
        this.checkItems.forEach(item => {

          price += item.singlePrice * item.itemCount;
          buyPrice += item.singleBuyPrice * item.itemCount;
          itemCount += item.itemCount;
        });
      }

      this.totalPrice = price;
      this.totalBuyPrice = buyPrice;
      this.totalItemCount = itemCount;
    }, timeOut);
  }

  cancel() {
    this.checkItems = [];
    this.updateValues();
  }

  onCredit() {
    this.customerMenu()
  }

  cash() {
    if (this.checkItems.length > 0) {

      this.checkItems.forEach(item => {
        this.productService.changeStockAmount(item.barcode, -item.itemCount);
      });

      this.CheckOutService.checkOut(new VaultEntity(
        new Date,
        this.checkItems,
        this.totalPrice,
        this.totalBuyPrice,
        this.isSecondPrice,
        true
      ))
      this.cancel();
    }
  }


  selectCustomer(customer?: Customer) {
    document.querySelector(`#customerIcon${this.selectedCustomer?.id}`)?.classList.remove('selectedCustomer')
    this.selectedCustomer = customer;
    document.querySelector(`#customerIcon${this.selectedCustomer?.id}`)?.classList.add('selectedCustomer')
  }

  customerMenu() {
    this.isCustomerMenuOpen = !this.isCustomerMenuOpen
    this.selectCustomer(this.selectedCustomer)
  }

  checkOutWithOnCredit() {
    if (this.checkItems.length > 0) {
      this.CheckOutService.checkOut(new VaultEntity(
        new Date,
        this.checkItems,
        this.totalPrice,
        this.totalBuyPrice,
        this.isSecondPrice,
        false,
        this.selectedCustomer
      )).then(() => {
        this.checkItems.forEach(item => {
          this.productService.changeStockAmount(item.barcode, -item.itemCount);
        });
        this.customerMenu()
        this.cancel();
      })
    }
  }

  openAndCloseAddGridItemBox() {
    this.isAddGridItemBoxOpen = !this.isAddGridItemBoxOpen;
  }

  selectImageForGridItem() {
    this.gridService.selectImage(this.barcodeForAddNewGridItem!).then(() => {
      this.gridService.getImageByBarcode(this.barcodeForAddNewGridItem!).then((binary) => {
        const img = document.querySelector("#selectImageBoxImage")

        const createdImage = URL.createObjectURL(
          new Blob([binary.buffer], { type: "image/png" }),
        )
        img?.setAttribute('src', createdImage)

        this.isImageSelected = true
      })
    })
  }

  addNewGridItem() {
    this.productService.getProductByBarcode(this.barcodeForAddNewGridItem!).then((value) => {
      if (value == undefined) {
        this.alertifyService.showAlert("Ürün Bulunamadı!", 2);
      } else {
        const img = document.querySelector("#selectImageBoxImage")
        img?.setAttribute('src', "assets/icons/selectImage.png");
        this.isImageSelected = false;
        this.openAndCloseAddGridItemBox();
        this.barcodeForAddNewGridItem = undefined;
        this.gridService.addNewGridItem(value.barcode!).then(() => this.setGridItemsList());
      }
    })
  }

  setGridItemsList() {
    this.gridService.getGridItemList().then((items) => {
      this.gridListItems = [];
      items.forEach(barcode => {
        this.productService.getProductByBarcode(barcode).then((product) => {
          this.gridService.getImageByBarcode(product?.barcode!).then((binary) => {

            const img = URL.createObjectURL(
              new Blob([binary.buffer], { type: "image/png" }),
            )

            this.gridListItems.push(product!)

            setTimeout(() => {
              document.querySelector(`#gridItem${product?.barcode}`)?.setAttribute('style', `background: url("${img}");background-size: cover;background-position: center;`)
            }, 500);
          })
        })
      })
    })
  }
}
