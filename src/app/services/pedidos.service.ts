import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pedido } from '../models/pedido';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private apiURL = 'http://localhost:3000/pedidos';

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiURL);
  }

  createPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiURL, pedido);
  }

  // Obtener un pedido por ID
  getPedidoById(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiURL}/${id}`);
  }

  // Actualizar un pedido existente
  updatePedido(id: string, pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiURL}/${id}`, pedido);
  }

  eliminarPedido(id: string): Observable<void> {
  return this.http.delete<void>(`${this.apiURL}/${id}`);
}
  getEstados(): Observable<string[]> {
  return this.http.get<any[]>('http://localhost:3000/estados').pipe(
    map(estados => estados.map(e => e.id))
  );
}

// pedidos.service.ts
cancelarPedido(id: string): Observable<void> {
  return this.http.patch<void>(`${this.apiURL}/${id}`, { estado: 'Cancelado' });
}

entregarPedido(id: string): Observable<void> {
  return this.http.patch<void>(`${this.apiURL}/${id}`, { estado: 'Entregado' });
}



}
