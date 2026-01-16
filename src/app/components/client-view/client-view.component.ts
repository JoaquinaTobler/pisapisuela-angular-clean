import { Component } from '@angular/core';
import { ClientesService } from '../../services/clientes.service';
import { Router } from '@angular/router';
import { Cliente } from '../../models/cliente';

@Component({
  selector: 'app-client-view',
  standalone: false,
  templateUrl: './client-view.component.html',
  styleUrl: './client-view.component.css'
})
export class ClientViewComponent {

clientes: Cliente[] = [];

  constructor(
    private clientesService: ClientesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientesService.getClients().subscribe(data => {
      this.clientes = data;
    });
  }

  editarCliente(id: string): void {
    this.router.navigate(['/clients/edit', id]);
  }

  eliminarCliente(id: string): void {
    if (confirm('¿Estás seguro que querés eliminar este cliente?')) {
      this.clientesService.deleteClient(id).subscribe(() => {
        this.clientes = this.clientes.filter(c => c.id !== id);
      });
    }
  }
}
