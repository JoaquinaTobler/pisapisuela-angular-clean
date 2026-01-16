import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-order-edit',
  standalone: false,
  templateUrl: './order-edit.component.html',
  styleUrl: './order-edit.component.css'
})
export class OrderEditComponent implements OnInit {
  
  pedidoForm!: FormGroup;
  pedidoId!: string;
  clientes: any[] = [];
  estados: string[] = [];
  pedidoOriginal: any; // 👈 agregamos esta propiedad


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pedidosService: PedidosService,
    private clientesService: ClientesService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();

    this.pedidoId = this.route.snapshot.paramMap.get('id') || '';

    this.clientesService.getClients().subscribe(data => this.clientes = data);

    this.pedidosService.getEstados().subscribe(data => this.estados = data);

    this.pedidosService.getPedidoById(this.pedidoId).subscribe(pedido => {
      if (pedido) {
        this.pedidoOriginal = pedido; // 👈 guardamos el original con productos
        this.pedidoForm.patchValue({
          id: pedido.id,
          cliente: pedido.cliente,
          fechaPedido: pedido.fechaPedido,
          senia: pedido.senia,
          estado: pedido.estado,
          comentarios: pedido.comentarios // 👈 ESTE CAMPO
        });
      } else {
        alert('Pedido no encontrado');
        this.router.navigate(['/orders/view']);
      }
    });
  }

  inicializarFormulario(): void {
    this.pedidoForm = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
      cliente: ['', Validators.required],
      fechaPedido: ['', Validators.required],
      senia: [0, Validators.required],
      estado: ['', Validators.required],
      comentarios : ['']
    });
  }

  onSubmit(): void {
     if (this.pedidoForm.valid) {
      const pedidoActualizado = {
        ...this.pedidoOriginal, // 👈 conservamos los productos y otros campos
        ...this.pedidoForm.getRawValue(), // solo sobreescribimos los editables
      };
      
      this.pedidosService.updatePedido(this.pedidoId, pedidoActualizado).subscribe(() => {
        alert('Pedido actualizado correctamente');
        this.router.navigate(['/orders/view']);
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/orders/view']);
  }
}
