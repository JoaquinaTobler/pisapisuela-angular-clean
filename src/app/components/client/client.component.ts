import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductosService } from '../../services/productos.service';
import { Router } from '@angular/router';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-client',
  standalone: false,
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit{

  clienteForm: FormGroup;
  clienteCreado: any = null;

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private router: Router
  ) {
    this.clienteForm = this.fb.group({
      id: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      celular: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.clientesService.getClients().subscribe(clientes => {
      const nuevoId = this.generarNuevoId(clientes);
      this.clienteForm.get('id')?.setValue(nuevoId);
      this.clienteForm.get('id')?.disable(); // para que no lo modifiquen
    });
  }

  generarNuevoId(clientes: any[]): string {
    let max = 0;
    clientes.forEach(p => {
      const match = p.id.match(/^cli(\d+)$/);
      if (match) {
        const numero = parseInt(match[1], 10);
        if (numero > max) {
          max = numero;
        }
      }
    });
    const nuevoNumero = (max + 1).toString().padStart(3, '0');
    return `cli${nuevoNumero}`;
  }

  onSubmit(): void {
    if (this.clienteForm.valid) {
      this.clienteForm.get('id')?.enable();

      const nuevoCliente = this.clienteForm.value;

      this.clientesService.createClient(nuevoCliente).subscribe(() => {
        this.clienteCreado = nuevoCliente;
        this.mostrarModal();
      });
    }
  }

  mostrarModal(): void {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('clienteCreadoModal')
    );
    modal.show();
  }

  cancelar(): void {
    this.router.navigate(['/clients/view']);
  }

  irAListado(): void {
    this.router.navigate(['/clients/view']);
  }
}
