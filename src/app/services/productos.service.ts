import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { catchError, Observable, of } from 'rxjs';
import { forkJoin, switchMap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiURL= 'http://localhost:3000';

  constructor(private http: HttpClient) { 
  }

  // --- CRUD de productos ---
  getProducts(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiURL}/productos`);
  }

  getProductById(id: string): Observable<Producto | null> {
    return this.http.get<Producto>(`${this.apiURL}/productos/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  createProduct(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiURL}/productos`, producto);
  }

  updateProduct(productId: string, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiURL}/productos/${productId}`, producto);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/productos/${id}`);
  }

  updateStock(id: string, cantidad: number): Observable<void> {
    return this.http.patch<void>(`${this.apiURL}/productos/${id}`, { cantidadEnStock: cantidad });
  }

   // Catálogos (tipos, talles, colores, etc.)
  getTiposDeProducto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/tiposDeProducto`);
  }

  getTalles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/talles`);
  }

  getColores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/colores`);
  }

  getColegios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/colegios`);
  }

  getTiposDeTela(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/tiposDeTela`);
  }

  saveProducts(productos: Producto[]): Observable<any> {
  // Primero obtenemos los productos actuales
  return this.getProducts().pipe(
    switchMap((productosExistentes) => {
      // Buscar el último ID numérico
      let maxId = 0;

      productosExistentes.forEach(p => {
        // Ejemplo: si el id es "p003", tomamos el número 3
        const numero = parseInt(p.id.replace(/\D/g, ''), 10);
        if (!isNaN(numero) && numero > maxId) {
          maxId = numero;
        }
      });

      // Asignar nuevos IDs a los productos del Excel
      const nuevosProductos = productos.map((prod, index) => ({
        ...prod,
        id: `prod${(maxId + index + 1).toString().padStart(3, '0')}`
      }));

      // Crear las peticiones POST para cada nuevo producto
      const requests = nuevosProductos.map(np =>
        this.http.post(`${this.apiURL}/productos`, np)
      );

      return forkJoin(requests);
    })
  );
}

createTipoDeProducto(nuevo: any): Observable<any> {
  return this.http.post(`${this.apiURL}/tiposDeProducto`, nuevo);
}

createTalle(nuevo: any): Observable<any> {
  return this.http.post(`${this.apiURL}/talles`, nuevo);
}

createColor(nuevo: any): Observable<any> {
  return this.http.post(`${this.apiURL}/colores`, nuevo);
}

createColegio(nuevo: any): Observable<any> {
  return this.http.post(`${this.apiURL}/colegios`, nuevo);
}

createTipoDeTela(nuevo: any): Observable<any> {
  return this.http.post(`${this.apiURL}/tiposDeTela`, nuevo);
}

}