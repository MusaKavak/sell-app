import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/Product';
import { ProductLogItem } from 'src/app/models/ProductLogItem';
import { AlertifyService } from 'src/app/services/alertify.service';
import { StatusCodes } from 'src/app/StatusCodes';
import { ProductPageViewmodel } from './products-page.viewmodel';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: [
    './products-page-form.css',
    './product-page-adjust-stock.css',
    './product-page-table.css',
    "./product-page-total.css",
    "./product-page-log-window.css"
  ]
})
export class ProductsPageComponent implements OnInit {

  viewmodel = new ProductPageViewmodel(this.alertifyService)

  //Ng
  searchValue: string = ""
  adjustStockInputValue: number = 0
  productForm?: FormGroup

  //Lists
  products: Array<Product> = []
  productLogs: ProductLogItem[] = []

  //Variables
  selectedProduct?: Product
  isLogWindowOpen = false
  selectImageSrc = "assets/icons/selectImage.png"
  loadingIconSrc = "assets/icons/loading.gif"
  imageSrc = this.selectImageSrc

  //Total
  totalProductAmount: number = 0
  totalBuyPrice: number = 0
  totalSellPrice: number = 0
  totalSecondSellPrice: number = 0

  constructor(
    private formBuilder: FormBuilder,
    private alertifyService: AlertifyService
  ) { }


  ngOnInit(): void {
    this.setProducts()
    this.createProductForm()
  }

  async setProducts() {
    this.products = await this.viewmodel.getProducts()
    this.totalProductAmount = 0
    this.totalBuyPrice = 0
    this.totalSellPrice = 0
    this.totalSecondSellPrice = 0
    for (const p of this.products) {
      this.totalProductAmount += p.stockAmount;
      this.totalBuyPrice += p.buyPrice * p.stockAmount;
      this.totalSellPrice += p.sellPrice * p.stockAmount;
      this.totalSecondSellPrice += p.secondSellPrice * p.stockAmount;
    }
  }

  createProductForm() {
    const formBuilderGroup = {
      barcode: ["", Validators.required],
      productName: ["", Validators.required],
      buyPrice: ["", Validators.required],
      sellPrice: ["", Validators.required],
      secondSellPrice: ["", Validators.required],
      stockAmount: ["", Validators.required],
      addToGrid: ["", Validators.required]
    }
    this.productForm = this.formBuilder.group(formBuilderGroup);
    this.productForm?.controls['addToGrid'].setValue(false)
  }

  addProduct() {
    if (this.productForm?.valid && this.viewmodel != null) {
      this.viewmodel.addNewProduct(Object.assign({}, this.productForm.value)).then(status => {
        if (status == StatusCodes.SUCCESS) {
          this.setProducts()
          this.clearSelectedProduct()
        }
      })
    }
  }

  updateProduct() {
    if (this.productForm?.valid) {
      this.viewmodel.updateProduct(Object.assign({}, this.productForm.value)).then(status => {
        if (status == StatusCodes.SUCCESS) {
          this.setProducts()
          this.clearSelectedProduct()
        }
      })
    }
  }

  deleteProduct() {
    if (this.productForm?.valid && this.selectedProduct != null) {
      this.viewmodel.deleteProduct(this.selectedProduct).then(status => {
        if (status == StatusCodes.SUCCESS) {
          this.setProducts()
          this.clearSelectedProduct()
        }
      })
    }
  }

  selectFirstListItemAsSelectedProduct() {
    document.getElementById("product-table-item")?.click()
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
    this.setImageSrc()
    for (const prop in product) {
      this.productForm?.controls[prop].setValue(product[prop as keyof typeof product])
    }
  }

  submitProductSearchBox() {
    document.getElementById('productListItem')?.click()
    this.searchValue = "";
  }

  adjustStock() {
    if (this.selectedProduct != null && this.adjustStockInputValue != null) {
      this.viewmodel.adjustStockAmount(this.selectedProduct, this.adjustStockInputValue).then(status => {
        if (status == StatusCodes.SUCCESS) {
          this.setProducts()
          this.clearSelectedProduct()
        }
      })
    }
  }

  clearSelectedProduct() {
    for (const prop in this.selectedProduct) {
      this.productForm?.controls[prop].setValue(undefined)
    }
    this.selectedProduct = undefined
    this.imageSrc = this.selectImageSrc
  }

  async openOrCloseLogWindow() {
    if (this.isLogWindowOpen) {
      this.isLogWindowOpen = false
      this.productLogs = []
    } else {
      this.productLogs = await this.viewmodel.getProductLogs()
      this.isLogWindowOpen = true
    }
  }

  copyBarcodeToClipboard(barcode: number, element: HTMLElement) {
    navigator.clipboard.writeText(barcode.toString()).then(() => {
      element.classList.add('active');
      setTimeout(() => {
        element.classList.remove('active');
      }, 2000);
    })
  }

  setImageSrc() {
    if (this.selectedProduct != undefined) {
      this.imageSrc = this.loadingIconSrc
      this.viewmodel.getImageBitmap(this.selectedProduct.barcode).then(response => {
        if (response.status == StatusCodes.SUCCESS) {
          this.imageSrc = response.imgSrc!!
        } else {
          this.imageSrc = this.selectImageSrc
        }
      })
    }
  }
  selectImage() {
    if (this.selectedProduct != undefined) {
      this.viewmodel.selectImageByBarcode(this.selectedProduct.barcode).then(code => {
        if (code == StatusCodes.SUCCESS) {
          this.setImageSrc()
        }
      })
    }
  }
}
