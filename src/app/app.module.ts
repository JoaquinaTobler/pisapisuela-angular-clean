import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { MatDialogModule} from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { RouterModule } from '@angular/router';
import { OrderComponent } from './components/order/order.component';
import { SaleComponent } from './components/sale/sale.component';
import { ClientComponent } from './components/client/client.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductViewComponent } from './product-view/product-view.component';
import { ProductEditComponent } from './components/product-edit/product-edit.component';
import { ProductsHomeComponent } from './components/products-home/products-home.component';
import { FormsModule } from '@angular/forms';
import { ClientHomeComponent } from './components/client-home/client-home.component';
import { ClientViewComponent } from './components/client-view/client-view.component';
import { ClientEditComponent } from './components/client-edit/client-edit.component';
import { OrderViewComponent } from './components/order-view/order-view.component';
import { OrderHomeComponent } from './components/order-home/order-home.component';
import { OrderEditComponent } from './components/order-edit/order-edit.component';
import { PedidoProductosComponent } from './components/pedido-productos/pedido-productos.component';
import { PedidoAddComponent } from './pedido-add/pedido-add.component';
import { UploadExcelComponent } from './components/upload-excel/upload-excel.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LandingPageComponent,
    ProductFormComponent,
    ConfirmationDialogComponent,
    OrderComponent,
    SaleComponent,
    ClientComponent,
    ProductViewComponent,
    ProductEditComponent,
    ProductsHomeComponent,
    ClientHomeComponent,
    ClientViewComponent,
    ClientEditComponent,
    OrderViewComponent,
    OrderHomeComponent,
    OrderEditComponent,
    PedidoProductosComponent,
    PedidoAddComponent,
    UploadExcelComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatDialogModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
