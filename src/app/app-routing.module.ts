import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { OrderComponent } from './components/order/order.component';
import { SaleComponent } from './components/sale/sale.component';
import { ClientComponent } from './components/client/client.component';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductEditComponent } from './components/product-edit/product-edit.component';
import { ProductsHomeComponent } from './components/products-home/products-home.component';
import { ClientHomeComponent } from './components/client-home/client-home.component';
import { ClientViewComponent } from './components/client-view/client-view.component';
import { ClientEditComponent } from './components/client-edit/client-edit.component';
import { OrderViewComponent } from './components/order-view/order-view.component';
import { OrderHomeComponent } from './components/order-home/order-home.component';
import { OrderEditComponent } from './components/order-edit/order-edit.component';
import { PedidoProductosComponent } from './components/pedido-productos/pedido-productos.component';
import { UploadExcelComponent } from './components/upload-excel/upload-excel.component';

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch:'full'},
  {path: 'home', component:LandingPageComponent},
  {path: 'products/home', component:ProductsHomeComponent},
  {path: 'products/upload-excel', component:UploadExcelComponent},
  {path: 'products/add', component:ProductFormComponent},
  {path: 'products/view', component:ProductViewComponent},
  {path: 'product/edit/:id', component:ProductEditComponent},
  {path: 'orders/add', component:OrderComponent},
  {path: 'orders/view', component:OrderViewComponent},
  {path: 'orders/home', component: OrderHomeComponent},
  {path: 'orders/edit/:id', component:OrderEditComponent},
  {path: 'sales/add', component:SaleComponent},
  {path: 'clients/add', component:ClientComponent},
  {path: 'clients/home', component:ClientHomeComponent},
  {path: 'clients/view', component: ClientViewComponent},
  {path: 'clients/edit/:id', component: ClientEditComponent},
  {path: 'orders/products', component: PedidoProductosComponent},
  {path: 'ventas/home', component: SaleComponent }


]; 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
