import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-product-edit',
  standalone: false,
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.css'
})
export class ProductEditComponent implements OnInit {

   productForm!: FormGroup;
  productId!: string;

  tiposDeProducto: any[] = [];
  talles: any[] = [];
  colores: any[] = [];
  colegios: any[] = [];
  tiposDeTela: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductosService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.inicializarFormulario();
    this.cargarCatalogos();
    this.cargarProducto();
  }

  inicializarFormulario(): void {
    this.productForm = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
      idtipoDeProducto: ['', Validators.required],
      idTalle: ['', Validators.required],
      idColor: ['', Validators.required],
      idColegio: ['', Validators.required],
      idtipoDeTela: ['', Validators.required],
      cantidadEnStock: ['', Validators.required],
      //precioUnitario: ['', Validators.required]
      precioCompraUnitario: ['', Validators.required],
      precioVentaUnitario: ['', Validators.required],
    });
  }

  cargarCatalogos(): void {
    this.productService.getTiposDeProducto().subscribe(data => this.tiposDeProducto = data);
    this.productService.getTalles().subscribe(data => this.talles = data);
    this.productService.getColores().subscribe(data => this.colores = data);
    this.productService.getColegios().subscribe(data => this.colegios = data);
    this.productService.getTiposDeTela().subscribe(data => this.tiposDeTela = data);
  }

  cargarProducto(): void {
    this.productService.getProductById(this.productId).subscribe(producto => {
      if (producto) {
        this.productForm.patchValue({
          id: producto.id,
          idtipoDeProducto: producto.idtipoDeProducto,
          idTalle: producto.idtalle,
          idColor: producto.idcolor,
          idColegio: producto.idcolegio,
          idtipoDeTela: producto.idtipoDeTela,
          cantidadEnStock: producto.cantidadEnStock,
          //precioUnitario: producto.precioUnitario
          precioCompraUnitario: producto.precioCompraUnitario,
          precioVentaUnitario: producto.precioVentaUnitario
        });
      } else {
        alert('Producto no encontrado');
        this.router.navigate(['/productos/view']);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productoActualizado = {
        id: this.productId,
        idtipoDeProducto: this.productForm.value.idtipoDeProducto,
        idtalle: this.productForm.value.idTalle,
        idcolor: this.productForm.value.idColor,
        idcolegio: this.productForm.value.idColegio,
        idtipoDeTela: this.productForm.value.idtipoDeTela,
        cantidadEnStock: this.productForm.value.cantidadEnStock,
        //precioUnitario: this.productForm.value.precioUnitario
        precioCompraUnitario: this.productForm.value.precioCompraUnitario,
        precioVentaUnitario: this.productForm.value.precioVentaUnitario
      };

      this.productService.updateProduct(this.productId, productoActualizado).subscribe(() => {
        alert('Producto actualizado exitosamente');
        this.router.navigate(['/products/view']);
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/products/view']);
  }
}
