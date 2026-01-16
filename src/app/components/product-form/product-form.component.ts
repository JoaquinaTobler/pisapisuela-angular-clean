import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PedidoTempService } from '../../services/pedido-temp.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit{

 productForm!: FormGroup;
  productoCreado: any = null;

  tiposDeProducto: any[] = [];
  talles: any[] = [];
  colores: any[] = [];
  colegios: any[] = [];
  tiposDeTela: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductosService
  ) {
    this.productForm = this.fb.group({
      id: ['', Validators.required],
      idtipoDeProducto: ['', Validators.required],
      idtalle: ['', Validators.required],
      idcolor: ['', Validators.required],
      idcolegio: ['', Validators.required],
      idtipoDeTela: ['', Validators.required],
      cantidadEnStock: ['', [Validators.required, Validators.min(0)]],
      //precioUnitario: ['', [Validators.required, Validators.min(0)]]
      precioCompraUnitario: ['', [Validators.required, Validators.min(0)]],
      precioVentaUnitario: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();

    // Autogenerar ID
    this.productService.getProducts().subscribe(productos => {
      const nuevoId = this.generarNuevoId(productos);
      this.productForm.get('id')?.setValue(nuevoId);
      this.productForm.get('id')?.disable(); // deshabilitado para que no lo cambien
    });
  }

  cargarCatalogos(): void {
    this.productService.getTiposDeProducto().subscribe(data => this.tiposDeProducto = data);
    this.productService.getTalles().subscribe(data => this.talles = data);
    this.productService.getColores().subscribe(data => this.colores = data);
    this.productService.getColegios().subscribe(data => this.colegios = data);
    this.productService.getTiposDeTela().subscribe(data => this.tiposDeTela = data);
  }

  generarNuevoId(productos: any[]): string {
    let max = 0;
    productos.forEach(p => {
      const match = p.id.match(/^prod(\d+)$/);
      if (match) {
        const numero = parseInt(match[1], 10);
        if (numero > max) {
          max = numero;
        }
      }
    });
    const nuevoNumero = (max + 1).toString().padStart(3, '0');
    return `prod${nuevoNumero}`;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      // habilitar el campo ID antes de enviar
      this.productForm.get('id')?.enable();

      const nuevoProducto = this.productForm.value;

      this.productService.createProduct(nuevoProducto).subscribe(() => {
    this.router.navigate(['/products/view']);
    });

    }
  }

  mostrarModal(): void {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('productoCreadoModal')
    );
    modal.show();
  }

  cancelar(): void {
    this.router.navigate(['/products/view']);
  }

  irAListado(): void {
    this.router.navigate(['/products/view']);
  }
}