import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../models/product';
import { AlertifyService } from '../services/alertify.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./product-page-stockInput.css', './products-page.component.css', './product-page-table.css'],
  providers: [ProductService, AlertifyService]
})
export class ProductsPageComponent implements OnInit {

  constructor(
    private productService: ProductService,
    private alertifyService: AlertifyService,
    private formBuilder: FormBuilder

  ) { }

  selectedProduct?: Product;
  productList: Array<Product> = [];
  searchValue?: string

  stockAmountInputValue?: number = 0;

  ngOnInit(): void {
    this.setProductList()
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
    this.productService.getProducts().then((list) => {
      this.productList = list
    })
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
    document.getElementById("searchBox-Input")?.addEventListener('keydown', (key) => {
      if (key.key == 'Enter') {
        document.getElementById('productListItem')?.click()
        this.searchValue = "";
      }
    })
  }

  adjustStock() {

    this.selectedProduct!.stockAmount! += this.stockAmountInputValue!

    this.productService.updateProduct(this.selectedProduct!)
    this.stockAmountInputValue = 0;
    this.setSelectedProductNull()
  }

  setSelectedProductNull() {
    this.selectedProduct = undefined
    this.addProductForm.controls['barcode'].setValue(undefined)
    this.addProductForm.controls['productName'].setValue(undefined)
    this.addProductForm.controls['buyPrice'].setValue(undefined)
    this.addProductForm.controls['sellPrice'].setValue(undefined)
    this.addProductForm.controls['secondSellPrice'].setValue(undefined)
    this.addProductForm.controls['stockAmount'].setValue(undefined)
  }

  deleteProduct() {
    if (this.addProductForm?.valid) {
      var product: Product = Object.assign({}, this.addProductForm.value);

      this.productService.deleteProduct(product).then(() => this.setProductList())
      this.setSelectedProductNull()
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
}
