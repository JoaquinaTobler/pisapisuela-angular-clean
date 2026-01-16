import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Venta } from '../models/venta';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private apiURL = 'http://localhost:3000'; // tu backend

  constructor(private http: HttpClient) {}

  // Traer ventas (solo pedidos entregados)
  getVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/pedidos`);
  }

  // Actualizar una venta (pedido)
  updateVenta(id: string, ventaActualizada: any): Observable<any> {
    return this.http.patch(`${this.apiURL}/pedidos/${id}`, ventaActualizada);
  }

  createVenta(venta: any) {
  return this.http.post(`${this.apiURL}/ventas`, venta);
}
}