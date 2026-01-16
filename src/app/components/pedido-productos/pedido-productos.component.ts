import { Component, OnInit } from '@angular/core';
import { PedidoTempService } from '../../services/pedido-temp.service';
import { Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pedido-productos',
  standalone: false,
  templateUrl: './pedido-productos.component.html',
  styleUrl: './pedido-productos.component.css'
})
export class PedidoProductosComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  cantidades: { [productoId: string]: number } = {};
  
  carrito: { productoId: string;
  descripcion: string;
  cantidad: number;

  tipoProductoNombre: string;
  talleNombre: string;
  colorNombre: string;
  precioUnitario: number; }[] = [];

  filtros = {
    tipo: '',
    talle: '',
    color: '',
    colegio: '',
    tela: ''
  };

  // Catálogos como hash
  tiposDeProducto: any = {};
  talles: any = {};
  colores: any = {};
  colegios: any = {};
  tiposDeTela: any = {};

  // Listas para los select
  tiposDeProductoList: any[] = [];
  tallesList: any[] = [];
  coloresList: any[] = [];
  colegiosList: any[] = [];
  tiposDeTelaList: any[] = [];

  constructor(
    private productosService: ProductosService,
    private tempService: PedidoTempService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    const [tipos, talles, colores, colegios, telas] = await Promise.all([
      firstValueFrom(this.productosService.getTiposDeProducto()),
      firstValueFrom(this.productosService.getTalles()),
      firstValueFrom(this.productosService.getColores()),
      firstValueFrom(this.productosService.getColegios()),
      firstValueFrom(this.productosService.getTiposDeTela())
    ]);

    // Listas para los select
    this.tiposDeProductoList = tipos;
    this.tallesList = talles;
    this.coloresList = colores;
    this.colegiosList = colegios;
    this.tiposDeTelaList = telas;

    // Hash para visualización
    this.tiposDeProducto = this.convertirArrayAHash(tipos);
    this.talles = this.convertirArrayAHash(talles);
    this.colores = this.convertirArrayAHash(colores);
    this.colegios = this.convertirArrayAHash(colegios);
    this.tiposDeTela = this.convertirArrayAHash(telas);

    // Cargar productos y enriquecer
    this.productosService.getProducts().subscribe(productos => {
      this.productos = productos.map(p => ({
        ...p,
        tipoProductoNombre: this.tiposDeProducto[p.idtipoDeProducto],
        talleNombre: this.talles[p.idtalle],
        colorNombre: this.colores[p.idcolor],
        colegioNombre: this.colegios[p.idcolegio],
        tipoTelaNombre: this.tiposDeTela[p.idtipoDeTela]
      }));

      this.aplicarFiltro();
    });
  }

  aplicarFiltro(): void {
    this.productosFiltrados = this.productos.filter(p =>
      (!this.filtros.tipo || p.idtipoDeProducto === this.filtros.tipo) &&
      (!this.filtros.talle || p.idtalle === this.filtros.talle) &&
      (!this.filtros.color || p.idcolor === this.filtros.color) &&
      (!this.filtros.colegio || p.idcolegio === this.filtros.colegio) &&
      (!this.filtros.tela || p.idtipoDeTela === this.filtros.tela)
    );
  }

  limpiarFiltros(): void {
    this.filtros = { tipo: '', talle: '', color: '', colegio: '', tela: '' };
    this.aplicarFiltro();
  }

  agregarProducto(prod: any): void {
  const cantidad = this.cantidades[prod.id] || 1;
  if (cantidad <= 0 || cantidad > prod.cantidadEnStock) return;

  const item = this.carrito.find(p => p.productoId === prod.id);

  if (item) {
    item.cantidad += cantidad;
  } else {
    this.carrito.push({
      productoId: prod.id,
      descripcion: prod.descripcion,
      cantidad,

      tipoProductoNombre: prod.tipoProductoNombre,
      talleNombre: prod.talleNombre,
      colorNombre: prod.colorNombre,
      precioUnitario: prod.precioVentaUnitario
    });
  }
}

aumentarCantidad(item: any): void {
  const prod = this.productos.find(p => p.id === item.productoId);
  if (!prod) return;

  if (item.cantidad < prod.cantidadEnStock) {
    item.cantidad++;
  }
}

disminuirCantidad(item: any): void {
  if (item.cantidad > 1) {
    item.cantidad--;
  }
}

calcularTotal(): number {
  return this.carrito.reduce((total, item) =>
    total + item.cantidad * item.precioUnitario, 0
  );
}

  quitarProducto(id: string): void {
    this.carrito = this.carrito.filter(p => p.productoId !== id);
  }

  finalizarSeleccion(): void {
    const productosSeleccionados = this.carrito.map(p => ({
      productoId: p.productoId,
      cantidad: p.cantidad
    }));

    this.tempService.setProductosSeleccionados(productosSeleccionados);
    this.router.navigate(['/orders/add']);
  }

  convertirArrayAHash(arr: any[]): any {
    return arr.reduce((acc, item) => {
      acc[item.id] = item.nombre;
      return acc;
    }, {});
  }

  getTotalCarrito(): number {
    return this.carrito.reduce((total, item) => {
      const prod = this.productos.find(p => p.id === item.productoId);
      return total + (prod?.precioUnitario || 0) * item.cantidad;
    }, 0);
  }

  validarCantidad(productoId: string, stockDisponible: number): void {
    const cantidad = this.cantidades[productoId];
    if (cantidad > stockDisponible) {
      this.cantidades[productoId] = stockDisponible;
      alert(`⚠️ La cantidad no puede superar el stock disponible (${stockDisponible}). Se ajustó automáticamente.`);
    } if (cantidad < 1) {
      this.cantidades[productoId] = 1;
      alert("⚠️ La cantidad mínima es 1.");
    }

    // También asegurarse que sea un número entero 

    if (cantidad % 1 !== 0) { this.cantidades[productoId] = Math.floor(cantidad); }
  }


}