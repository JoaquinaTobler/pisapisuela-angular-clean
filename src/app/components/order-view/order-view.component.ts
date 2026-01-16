import { Component, OnInit } from '@angular/core';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes.service';
import { Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-order-view',
  standalone: false,
  templateUrl: './order-view.component.html',
  styleUrl: './order-view.component.css'
})
export class OrderViewComponent  implements OnInit{
  
  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];
  clientes: any[] = [];
  colegios: any[] = []; // <--- Nueva lista para el combo de filtros

  filtros = {
    estado: '',
    cliente: '',
    colegio: '', // <--- Nuevo filtro
    fechaDesde: '',
    fechaHasta: ''
  };

  constructor(
    private pedidosService: PedidosService,
    private productosService: ProductosService,
    private clientesService: ClientesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Usamos forkJoin para asegurarnos de tener clientes y colegios antes de procesar pedidos
    forkJoin({
      clientes: this.clientesService.getClients(),
      colegios: this.productosService.getColegios(),
      pedidos: this.pedidosService.getPedidos()
    }).subscribe(({ clientes, colegios, pedidos }) => {
      this.clientes = clientes;
      this.colegios = colegios;
      
      // Enriquecemos los pedidos con la información de colegio de sus productos
      // Esto es opcional pero ayuda a que el filtro sea mucho más rápido
      this.pedidos = pedidos;
      this.pedidosFiltrados = [...this.pedidos];
    });
  }

  aplicarFiltro(): void {
    this.pedidosFiltrados = this.pedidos.filter(p => {
      const cumpleEstado = !this.filtros.estado || p.estado?.toLowerCase() === this.filtros.estado.toLowerCase();
      const cumpleCliente = !this.filtros.cliente || p.cliente === this.filtros.cliente;
      const cumpleFechaDesde = !this.filtros.fechaDesde || new Date(p.fechaPedido) >= new Date(this.filtros.fechaDesde);
      const cumpleFechaHasta = !this.filtros.fechaHasta || new Date(p.fechaPedido) <= new Date(this.filtros.fechaHasta);
      
      // Lógica de filtro por Colegio:
      // Si el filtro está vacío, pasa. Si tiene valor, revisa si algún producto del pedido coincide.
      const cumpleColegio = !this.filtros.colegio || 
        (p.productos && p.productos.some((item: any) => item.idcolegio === this.filtros.colegio));

      return cumpleEstado && cumpleCliente && cumpleFechaDesde && cumpleFechaHasta && cumpleColegio;
    });
  }

  limpiarFiltros(): void {
    this.filtros = { estado: '', cliente: '', colegio: '', fechaDesde: '', fechaHasta: '' };
    this.pedidosFiltrados = [...this.pedidos];
  }

  nombreCliente(id: string): string {
    const cliente = this.clientes.find(c => c.id === id);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : id;
  }

  editarPedido(id: string): void {
    this.router.navigate(['/orders/edit', id]); // Asegurate que tu ruta sea `/orders/edit/:id`
  }

  cancelarPedido(id: string): void {
  if (confirm('¿Querés cancelar este pedido? Se devolverá el stock de los productos.')) {
    this.pedidosService.getPedidoById(id).subscribe(pedido => {
      if (!pedido) {
        alert('No se encontró el pedido.');
        return;
      }

      if (pedido.estado === 'Cancelado') {
        alert('El pedido ya está cancelado.');
        return;
      }

      if (Array.isArray(pedido.productos) && pedido.productos.length > 0) {
        pedido.productos.forEach((item: any) => {
          this.productosService.getProductById(item.productoId).subscribe(producto => {
            if (producto) {
              const nuevoStock = producto.cantidadEnStock + item.cantidad;
              this.productosService.updateStock(producto.id, nuevoStock).subscribe(() => {
                console.log(`Stock de ${producto.id} actualizado a ${nuevoStock}`);
              });
            }
          });
        });
      }

      // Cambiar estado del pedido a Cancelado
      this.pedidosService.cancelarPedido(id).subscribe(() => {
        pedido.estado = 'Cancelado';
        const index = this.pedidos.findIndex(p => p.id === id);
        if (index !== -1) this.pedidos[index] = pedido;
        this.pedidosFiltrados = [...this.pedidos];
        alert('Pedido cancelado correctamente y stock restablecido.');
      });
    });
  }

  
}

entregarPedido(id: string): void {
  if (confirm('¿Querés marcar este pedido como entregado?')) {
    this.pedidosService.getPedidoById(id).subscribe(pedido => {
      if (!pedido) {
        alert('No se encontró el pedido.');
        return;
      }

      if (pedido.estado === 'Entregado') {
        alert('El pedido ya está marcado como entregado.');
        return;
      }

      if (pedido.estado === 'Cancelado') {
        alert('No se puede entregar un pedido cancelado.');
        return;
      }

      // Actualizar estado a Entregado
      this.pedidosService.entregarPedido(id).subscribe(() => {
        pedido.estado = 'Entregado';
        const index = this.pedidos.findIndex(p => p.id === id);
        if (index !== -1) this.pedidos[index] = pedido;
        this.pedidosFiltrados = [...this.pedidos];
        alert('Pedido marcado como entregado correctamente.');
      });
    });
  }
}



}
