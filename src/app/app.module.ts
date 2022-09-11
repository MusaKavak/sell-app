import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CheckPageComponent } from './check-page/check-page.component';
import { ProductService } from './services/product.service';
import { ProductsPageComponent } from './products-page/products-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertifyService } from './services/alertify.service';
import { VaultPageComponent } from './vault-page/vault-page.component';
import { ProductFilterPipe } from './products-page/product-filter.pipe';
import { CustomerPageComponent } from './customer-page/customer-page.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CustomerService } from './services/customer.service';

@NgModule({
  declarations: [
    AppComponent,
    CheckPageComponent,
    ProductsPageComponent,
    VaultPageComponent,
    ProductFilterPipe,
    CustomerPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  ],
  providers: [
    ProductService,
    AlertifyService,
    CustomerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
