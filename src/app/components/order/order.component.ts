import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { ProductosService } from '../../services/productos.service';
import { PedidoTempService } from '../../services/pedido-temp.service';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit{

  orderForm: FormGroup;
  clientes: any[] = [];
  productos: any[] = [];
  productosSeleccionados: any[] = [];

  constructor(
    private fb: FormBuilder,
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private tempService: PedidoTempService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      id: ['', Validators.required],
      cliente: ['', Validators.required],
      fechaPedido: ['', Validators.required],
      senia: [0, [Validators.required, Validators.min(0)]],
      estado: ['Pendiente', Validators.required],
      productos: this.fb.array([]),
      comentarios: [''] // Nuevo campo
    });
  }

  ngOnInit(): void {
  this.clientesService.getClients().subscribe(clientes => this.clientes = clientes);
  this.productosService.getProducts().subscribe(prod => this.productos = prod);

  this.pedidosService.getPedidos().subscribe(pedidos => {
    const nuevoId = this.generarNuevoId(pedidos);
    this.orderForm.get('id')?.setValue(nuevoId);
    this.orderForm.get('id')?.disable();
    const hoy = new Date().toISOString().split('T')[0];
    this.orderForm.get('fechaPedido')?.setValue(hoy);
  });

  const datosGuardados = this.tempService.getDatosTemporalesPedido();
  if (datosGuardados && Object.keys(datosGuardados).length > 0) {
    this.orderForm.patchValue(datosGuardados);
  }

  this.productosSeleccionados = this.tempService.getProductosSeleccionados();

  // cargar productos seleccionados al formArray
  this.productosForm.clear();
  this.productosSeleccionados.forEach(item => {
    this.productosForm.push(this.fb.group({
      productoId: [item.productoId, Validators.required],
      cantidad: [item.cantidad, [Validators.required, Validators.min(1)]]
    }));
  });
}

  get productosForm(): FormArray {
    return this.orderForm.get('productos') as FormArray;
  }

  agregarProducto(): void {
    const productoGroup = this.fb.group({
      productoId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
    this.productosForm.push(productoGroup);
  }

  eliminarProducto(index: number): void {
    this.productosForm.removeAt(index);
  }

  generarNuevoId(pedidos: any[]): string {
    let max = 0;
    pedidos.forEach(p => {
      const match = p.id.match(/^ped(\d+)$/);
      if (match) {
        const numero = parseInt(match[1], 10);
        if (numero > max) max = numero;
      }
    });
    return `ped${(max + 1).toString().padStart(3, '0')}`;
  }

  onSubmit(): void {
  if (this.orderForm.valid) {
    this.orderForm.get('id')?.enable();
    const formValue = this.orderForm.value;

    // --- 🔽 Actualizar stock por cada producto del pedido ---
    formValue.productos.forEach((item: any) => {
      const producto = this.productos.find(p => p.id === item.productoId);
      if (producto) {
        const nuevoStock = producto.cantidadEnStock - item.cantidad;

        if (nuevoStock < 0) {
          alert(`No hay suficiente stock de ${producto.nombre}. Stock disponible: ${producto.cantidadEnStock}`);
          throw new Error('Stock insuficiente');
        }

        // Actualizar en el servidor (PATCH o PUT)
        const productoActualizado = { ...producto, cantidadEnStock: nuevoStock };
        this.productosService.updateProduct(producto.id, productoActualizado).subscribe();
      }
    });
    // --- 🔼 fin actualización de stock ---

    // Crear el pedido en el backend
    this.pedidosService.createPedido(formValue).subscribe(() => {
      this.tempService.limpiar();
      this.router.navigate(['/orders/view']);
    });
  }
}

  getNombreProducto(id: string): string {
  const p = this.productos.find(prod => prod.id === id);
  return p ? `${id} - ${p.precioUnitario} ARS` : id;
}

irASeleccionarProductos(): void {
  this.tempService.setDatosTemporalesPedido(this.orderForm.getRawValue());
  this.router.navigate(['/orders/products']);
}


  cancelar(): void {
  this.limpiarProductosForm();
  this.orderForm.reset({
    id: '',
    cliente: '',
    fechaPedido: '',
    senia: 0,
    estado: 'Pendiente',
    productos: []
  });
  this.tempService.limpiar();
  this.router.navigate(['/orders/view']);
}


private limpiarProductosForm(): void {
  while (this.productosForm.length !== 0) {
    this.productosForm.removeAt(0);
  }
}


}


