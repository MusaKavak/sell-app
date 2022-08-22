import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPageComponent } from './check-page/check-page.component';
import { CustomerPageComponent } from './customer-page/customer-page.component';
import { ProductsPageComponent } from './products-page/products-page.component';
import { VaultPageComponent } from './vault-page/vault-page.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'check' },
  { path: 'check', component: CheckPageComponent },
  { path: "products", component: ProductsPageComponent },
  { path: "vault", component: VaultPageComponent },
  { path: "customers", component: CustomerPageComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
