import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../services/productos.service';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-product-view',
  standalone: false,
  templateUrl:'./product-view.component.html',
  styleUrl: './product-view.component.css'
})
export class ProductViewComponent implements OnInit {

   productos: any[] = [];
  productosFiltrados: any[] = [];

  productosSeleccionados: Set<string> = new Set();
  seleccionarTodos = false;

  tiposDeProducto: any = {};
  talles: any = {};
  colores: any = {};
  colegios: any = {};
  tiposDeTela: any = {};

  tiposDeProductoList: any[] = [];
  tallesList: any[] = [];
  coloresList: any[] = [];
  colegiosList: any[] = [];
  tiposDeTelaList: any[] = [];

  filtros = {
    tipo: '',
    talle: '',
    color: '',
    colegio: '',
    tela: ''
  };

  constructor(
    private productService: ProductosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCatalogosYProductos();
  }

  cargarCatalogosYProductos(): void {
    Promise.all([
      firstValueFrom(this.productService.getTiposDeProducto()),
      firstValueFrom(this.productService.getTalles()),
      firstValueFrom(this.productService.getColores()),
      firstValueFrom(this.productService.getColegios()),
      firstValueFrom(this.productService.getTiposDeTela())
    ]).then(([tipos, talles, colores, colegios, telas]) => {

      this.tiposDeProductoList = tipos;
      this.tallesList = talles;
      this.coloresList = colores;
      this.colegiosList = colegios;
      this.tiposDeTelaList = telas;

      this.tiposDeProducto = this.convertirArrayAHash(tipos);
      this.talles = this.convertirArrayAHash(talles);
      this.colores = this.convertirArrayAHash(colores);
      this.colegios = this.convertirArrayAHash(colegios);
      this.tiposDeTela = this.convertirArrayAHash(telas);

      this.productService.getProducts().subscribe(productos => {
        this.productos = productos.map(p => ({
          ...p,
          tipoProducto: this.tiposDeProducto[p.idtipoDeProducto],
          talle: this.talles[p.idtalle],
          color: this.colores[p.idcolor],
          colegio: this.colegios[p.idcolegio],
          tipoTela: this.tiposDeTela[p.idtipoDeTela]
        }));

        this.aplicarFiltro();
      });
    });
  }

  convertirArrayAHash(array: any[]): any {
    return array.reduce((acc, item) => {
      acc[item.id] = item.nombre;
      return acc;
    }, {});
  }

  aplicarFiltro(): void {
    this.productosFiltrados = this.productos.filter(p =>
      (!this.filtros.tipo || p.idtipoDeProducto === this.filtros.tipo) &&
      (!this.filtros.talle || p.idtalle === this.filtros.talle) &&
      (!this.filtros.color || p.idcolor === this.filtros.color) &&
      (!this.filtros.colegio || p.idcolegio === this.filtros.colegio) &&
      (!this.filtros.tela || p.idtipoDeTela === this.filtros.tela)
    );

    this.productosSeleccionados.clear();
    this.seleccionarTodos = false;
  }

  limpiarFiltros(): void {
    this.filtros = { tipo: '', talle: '', color: '', colegio: '', tela: '' };
    this.aplicarFiltro();
  }

  toggleProducto(id: string): void {
    if (this.productosSeleccionados.has(id)) {
      this.productosSeleccionados.delete(id);
    } else {
      this.productosSeleccionados.add(id);
    }
  }

  toggleSeleccionarTodos(): void {
    this.productosSeleccionados.clear();

    if (this.seleccionarTodos) {
      this.productosFiltrados.forEach(p =>
        this.productosSeleccionados.add(p.id)
      );
    }
  }

  eliminarSeleccionados(): void {
    if (!confirm(`¿Eliminar ${this.productosSeleccionados.size} productos?`)) {
      return;
    }

    const ids = Array.from(this.productosSeleccionados);

    ids.forEach(id => {
      this.productService.deleteProduct(id).subscribe();
    });

    this.productos = this.productos.filter(p => !this.productosSeleccionados.has(p.id));
    this.productosSeleccionados.clear();
    this.seleccionarTodos = false;
    this.aplicarFiltro();
  }

  editarProducto(id: string): void {
    this.router.navigate(['/product/edit', id]);
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.productos = this.productos.filter(p => p.id !== id);
        this.aplicarFiltro();
      });
    }
  }
}

