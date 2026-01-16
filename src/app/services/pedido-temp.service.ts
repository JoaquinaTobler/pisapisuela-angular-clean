import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PedidoTempService {
  
  private datosTemporalesPedido: any = {};
  private productosSeleccionados: any[] = [];
   private productosAEIaborar: any[] = [];

  setDatosTemporalesPedido(data: any) {
    this.datosTemporalesPedido = data;
  }

  getDatosTemporalesPedido() {
    return this.datosTemporalesPedido;
  }

  setProductosSeleccionados(productos: any[]) {
    this.productosSeleccionados = productos;
  }
  
  getProductosSeleccionados(): any[] {
    return this.productosSeleccionados;
  }


  setProductosAEIaborar(productos: any[]): void {
    this.productosAEIaborar = productos;
  }

  getProductosAEIaborar(): any[] {
    return this.productosAEIaborar;
  }

  clearAll(): void {
    this.productosSeleccionados = [];
    this.productosAEIaborar = [];
  }

  limpiar() {
    this.datosTemporalesPedido = {};
    this.productosSeleccionados = [];
  }
}
