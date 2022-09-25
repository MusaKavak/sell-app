import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogItem } from '../models/LogItem';
import { Product } from '../models/product';
import { AlertifyService } from '../services/alertify.service';
import { LogService } from '../services/log.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: [
    './product-page-stockInput.css',
    './products-page.component.css',
    './product-page-table.css',
    "./product-page-total.css",
    "./product-page-log.css"
  ],
  providers: [ProductService, AlertifyService, LogService]
})
export class ProductsPageComponent implements OnInit {

  constructor(
    private productService: ProductService,
    private alertifyService: AlertifyService,
    private logService: LogService,
    private formBuilder: FormBuilder
  ) { }

  selectedProduct?: Product;
  productList: Array<Product> = [];
  logWindowPageList: Array<Array<LogItem>> = [];
  searchValue?: string;

  stockAmountInputValue?: number = 0;

  totalProductAmount: number = 0;
  totalBuyPrice: number = 0;
  totalSellPrice: number = 0;
  totalSecondSellPrice: number = 0;
  isLogWindowOpen = false;
  currentLogPage = 0;
  isLogListReversed = false


  ngOnInit(): void {
    this.setProductList();
    this.createAddProductForm();
    this.setListeners();
  }

  addProductForm !: FormGroup;

  createAddProductForm() {
    this.addProductForm = this.formBuilder.group({
      barcode: ["", Validators.required],
      productName: ["", Validators.required],
      buyPrice: ["", Validators.required],
      sellPrice: ["", Validators.required],
      secondSellPrice: ["", Validators.required],
      stockAmount: ["", Validators.required],
    });
  }

  addProduct() {
    if (this.addProductForm?.valid) {
      var product: Product = Object.assign({}, this.addProductForm.value);

      this.productService.addNewProduct(product).then((response) => {
        if (response) {
          this.alertifyService.showAlert('Ürün Eklendi', 1);
          this.setSelectedProductNull()
          this.setProductList()
        } else {
          this.alertifyService.showAlert('Ürün Mevcut', 3);
        }
      })
    }
  }

  setProductList() {
    setTimeout(() => {
      this.productService.getProducts().then((list) => {
        this.productList = list;
        var tpa = 0;
        var tby = 0;
        var tsp = 0;
        var tssp = 0;
        list.forEach(p => {
          tpa += p.stockAmount;
          tby += p.buyPrice * p.stockAmount;
          tsp += p.sellPrice * p.stockAmount;
          tssp += p.secondSellPrice * p.stockAmount;
        });
        this.totalProductAmount = tpa;
        this.totalBuyPrice = tby;
        this.totalSellPrice = tsp;
        this.totalSecondSellPrice = tssp;
      })
    }, 300);
  }

  openNewProductDialog() {
    var dialog = document.querySelector(".newProductContainer")
    dialog?.classList.remove("invisible");
  }

  closeNewProductDialog() {
    var dialog = document.querySelector(".newProductContainer")
    dialog?.classList.add("invisible");
    this.setProductList()
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
    this.addProductForm.controls['barcode'].setValue(product.barcode)
    this.addProductForm.controls['productName'].setValue(product.productName)
    this.addProductForm.controls['buyPrice'].setValue(product.buyPrice)
    this.addProductForm.controls['sellPrice'].setValue(product.sellPrice)
    this.addProductForm.controls['secondSellPrice'].setValue(product.secondSellPrice)
    this.addProductForm.controls['stockAmount'].setValue(product.stockAmount)
  }

  updateProduct() {
    if (this.addProductForm?.valid) {
      var product: Product = Object.assign({}, this.addProductForm.value);
      this.productService.updateProduct(product).then(() => {
        this.setProductList();
        this.setLazyLoad();
      })
    }
    this.setSelectedProductNull()
  }

  onFocused() {
    const stockAmountInput = document.getElementById("stockAmount-input");

    stockAmountInput?.setAttribute("style", "margin-top: 35vh;left: calc(222% - 750px)");
  }

  changeInputValue(number: number) {
    this.stockAmountInputValue! += number;
  }

  setListeners() {
    setTimeout(() => {
      document.getElementById("searchBox-Input")?.addEventListener('keydown', (key) => {
        if (key.key == 'Enter') {
          document.getElementById('productListItem')?.click()
          this.searchValue = "";
        }
      })
      this.setLazyLoad()
    }, 350);
  }

  adjustStock() {
    console.log(this.selectedProduct)
    this.productService.changeStockAmount(this.selectedProduct!.barcode, this.stockAmountInputValue!).then((() => {
      this.productService.addStockLog(this.selectedProduct!, this.stockAmountInputValue!)
      this.stockAmountInputValue = 0;
      this.setSelectedProductNull()
    }))
  }

  setSelectedProductNull() {
    this.selectedProduct = undefined
    this.addProductForm.controls['barcode'].setValue(undefined)
    this.addProductForm.controls['productName'].setValue(undefined)
    this.addProductForm.controls['buyPrice'].setValue(undefined)
    this.addProductForm.controls['sellPrice'].setValue(undefined)
    this.addProductForm.controls['secondSellPrice'].setValue(undefined)
    this.addProductForm.controls['stockAmount'].setValue(undefined)
    this.setLazyLoad()
  }

  deleteProduct() {
    if (this.addProductForm?.valid) {
      var product: Product = Object.assign({}, this.addProductForm.value);

      this.productService.deleteProduct(product).then(() => this.setProductList())
      this.setSelectedProductNull()
      this.setLazyLoad()
    }
  }

  copyToClipboard(barcode: number, isName: boolean) {
    var text = ""

    if (isName) {
      text = this.productList.find(p => p.barcode == barcode)?.productName || "";
    } else {
      text = barcode.toString();
    }

    navigator.clipboard.writeText(text).then(() => {
      var selector = isName ? "Name" : "Barcode";
      const bubble = document.querySelector(`.copiedBubble.${selector}${barcode}`)!;
      bubble.classList.add('active');
      setTimeout(() => {
        bubble.classList.remove('active');
      }, 2000);
    })

  }

  setLazyLoad() {
    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.remove("disable")
        } else {
          e.target.classList.add("disable")
        }
      })
    }
    const observer = new IntersectionObserver(callback, {
      root: document.querySelector(".productTable-cover")
    })

    const targets = document.querySelectorAll("#productListItem");

    for (let i = 0; i < targets.length; i++) {
      observer.observe(targets[i])
    }
  }

  setLogList() {
    this.logService.getLogs().then((logs) => {
      setTimeout(() => {
        // let reversed = logs
        // if (!this.isLogListReversed) {
        //   reversed = logs.reverse()
        //   this.isLogListReversed = true
        // }
        this.setLogPages(logs.reverse())
      }, 250);
    })
  }

  openOrCloseLogWindow() {
    if (!this.isLogWindowOpen) {
      this.setLogList()
    }
    this.isLogWindowOpen = !this.isLogWindowOpen
  }

  setLogPages(list: Array<LogItem>) {
    const logWindowHeight = document.getElementById("logWindow")?.clientHeight
    if (logWindowHeight != undefined) {
      this.logWindowPageList = [];
      const itemPerPage = Math.floor((logWindowHeight - 85) / 70);
      var lastItemIndex = 0
      while (lastItemIndex < list.length) {
        this.logWindowPageList.push(list.slice(lastItemIndex, lastItemIndex + itemPerPage))
        lastItemIndex += itemPerPage
      }
      setTimeout(() => {
        this.toPage(this.currentLogPage)
      }, 500);
    }
  }

  toPage(pageIndex: number) {
    const logWindow = document.getElementById("logWindow")
    const pages = document.querySelectorAll("#transactionPage")
    const selectors = document.querySelectorAll("#selector")
    for (let i = 0; i < pages.length; i++) {
      if (i == pageIndex) {
        pages[i].classList.remove("disable")
        selectors[i].classList.add("active")
      }
      else {
        pages[i].classList.add("disable")
        selectors[i].classList.remove("active")
      }
    }
    logWindow?.scrollTo({
      left: (pageIndex * logWindow.clientWidth),
      behavior: 'smooth'
    })
    if (selectors[0] != null) {
      selectors[0].parentElement?.setAttribute("style", `left:${(pageIndex * logWindow!!.clientWidth)}px;`)
    }
  }

}
