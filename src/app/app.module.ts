//Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Compoments
import { AppComponent } from './app.component';
import { CheckPageComponent } from './views/check-page/check-page.component';
import { VaultPageComponent } from './views/vault-page/vault-page.component';
import { CustomerPageComponent } from './views/customer-page/customer-page.component';
import { ProductsPageComponent } from './views/products-page/products-page.component';
import { ProductFilterPipe } from './views/products-page/product-filter.pipe';
import { AlertifyService } from './services/alertify.service';

@NgModule({
  declarations: [
    AppComponent,
    CheckPageComponent,
    VaultPageComponent,
    ProductsPageComponent,
    ProductFilterPipe,
    CustomerPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    AlertifyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
