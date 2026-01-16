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

  // Objetos para obtener nombre por id
  tiposDeProducto: any = {};
  talles: any = {};
  colores: any = {};
  colegios: any = {};
  tiposDeTela: any = {};

  // Listas originales para los dropdowns
  tiposDeProductoList: any[] = [];
  tallesList: any[] = [];
  coloresList: any[] = [];
  colegiosList: any[] = [];
  tiposDeTelaList: any[] = [];

  // Filtros seleccionados
  filtros = {
    tipo: '',
    talle: '',
    color: '',
    colegio: '',
    tela: ''
  };

  constructor(private productService: ProductosService,
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
      // Guardamos las listas completas para los dropdowns
      this.tiposDeProductoList = tipos;
      this.tallesList = talles;
      this.coloresList = colores;
      this.colegiosList = colegios;
      this.tiposDeTelaList = telas;

      // Convertimos a hash para mostrar nombres en la tabla
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

        this.aplicarFiltro(); // Para inicializar productos filtrados
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
  }

  limpiarFiltros(): void {
    this.filtros = { tipo: '', talle: '', color: '', colegio: '', tela: '' };
    this.aplicarFiltro();
  }

  editarProducto(id: string): void {
    this.productService.getProductById(id).subscribe(producto => {
      if (producto) {
        console.log('Producto a editar:', producto);
        this.router.navigate(['/product/edit', id]);
      } else {
        console.warn('Producto no encontrado');
      }
    });
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Estás seguro que querés eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.productos = this.productos.filter(p => p.id !== id);
        this.aplicarFiltro(); // Actualizar la tabla filtrada
      });
    }
  }
}

