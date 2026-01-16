import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../services/productos.service';
import { PedidoTempService } from '../services/pedido-temp.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedido-add',
  standalone: false,
  templateUrl: './pedido-add.component.html',
  styleUrl: './pedido-add.component.css'
})
export class PedidoAddComponent implements OnInit {

  productosSeleccionados: any[] = [];
  total = 0;
  clientes: any[] = [];
  clienteSeleccionado = '';

  constructor(
    private tempService: PedidoTempService,
    private productosService: ProductosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const seleccionados = this.tempService.getProductosSeleccionados();
    if (!seleccionados.length) {
      this.router.navigate(['/pedido/productos']);
      return;
    }

    // Recuperar los datos completos de los productos
    this.productosService.getProducts().subscribe(productos => {
      this.productosSeleccionados = seleccionados.map(sel => {
        const producto = productos.find(p => p.id === sel.productoId);
        return {
          ...producto,
          cantidad: sel.cantidad,
          subtotal: (producto?.precioVentaUnitario || 0) * sel.cantidad
        };
      });

      this.calcularTotal();
    });

    // Ejemplo: cargar clientes (puede venir de un servicio real)
    // this.clientesService.getClientes().subscribe(c => this.clientes = c);
  }

  calcularTotal(): void {
    this.total = this.productosSeleccionados.reduce(
      (sum, p) => sum + p.subtotal,
      0
    );
  }

  confirmarPedido(): void {
    if (!this.clienteSeleccionado) {
      alert('Seleccioná un cliente antes de confirmar el pedido.');
      return;
    }

    const pedido = {
      clienteId: this.clienteSeleccionado,
      productos: this.productosSeleccionados.map(p => ({
        productoId: p.id,
        cantidad: p.cantidad,
        precioVentaUnitario: p.precioVentaUnitario
      })),
      total: this.total,
      fecha: new Date()
    };

    // Enviar pedido al backend o servicio
    console.log('Pedido confirmado:', pedido);

    // Limpiar el servicio temporal
    this.tempService.limpiar();

    // Navegar de vuelta al listado de pedidos
    this.router.navigate(['/orders']);
  }

  irOrdenProductos(): void {
    this.router.navigate(['/orders/products']);
  }

  
}
