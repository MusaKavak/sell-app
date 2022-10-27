import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPageComponent } from './views/check-page/check-page.component';
import { CustomerPageComponent } from './views/customer-page/customer-page.component';
import { ProductsPageComponent } from './views/products-page/products-page.component';
import { VaultPageComponent } from './views/vault-page/vault-page.component';

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
