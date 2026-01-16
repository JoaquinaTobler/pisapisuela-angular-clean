import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-client-edit',
  standalone: false,
  templateUrl: './client-edit.component.html',
  styleUrl: './client-edit.component.css'
})
export class ClientEditComponent implements OnInit{

  clienteForm!: FormGroup;
  clienteId!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private clientesService: ClientesService
  ) {}

  ngOnInit(): void {
    this.clienteId = this.route.snapshot.paramMap.get('id')!;
    this.inicializarFormulario();
    this.cargarCliente();
  }

  inicializarFormulario(): void {
    this.clienteForm = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      celular: ['', Validators.required]
    });
  }

  cargarCliente(): void {
    this.clientesService.getClientById(this.clienteId).subscribe(cliente => {
      if (cliente) {
        this.clienteForm.patchValue({
          id: cliente.id,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          celular: cliente.celular
        });
      } else {
        alert('Cliente no encontrado');
        this.router.navigate(['/clients/view']);
      }
    });
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      const clienteActualizado = {
        id: this.clienteId,
        nombre: this.clienteForm.value.nombre,
        apellido: this.clienteForm.value.apellido,
        celular: this.clienteForm.value.celular
      };

      this.clientesService.updateClient(this.clienteId, clienteActualizado).subscribe(() => {
        alert('Cliente actualizado exitosamente');
        this.router.navigate(['/clients/view']);
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/clients/view']);
  }
}
