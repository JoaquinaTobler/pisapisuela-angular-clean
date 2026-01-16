import { Component } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { forkJoin, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload-excel',
  standalone: false,
  templateUrl: './upload-excel.component.html',
  styleUrl: './upload-excel.component.css'
})
export class UploadExcelComponent {

  productos: any[] = [];
  mensaje = '';
  cargando = false;
  Object = Object;

  constructor(private productosService: ProductosService) { }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      this.productos = jsonData;
    };
    reader.readAsArrayBuffer(file);
  }

  // Usamos async para manejar las peticiones secuencialmente
  async procesarProductosDesdeExcel(): Promise<void> {
    if (this.productos.length === 0) {
      alert('Primero debe cargar un archivo Excel.');
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    try {
      // 1. Obtener datos maestros (tipos, talles, etc.)
      const dataMaestra = await lastValueFrom(
        forkJoin({
          tipos: this.productosService.getTiposDeProducto(),
          talles: this.productosService.getTalles(),
          colores: this.productosService.getColores(),
          colegios: this.productosService.getColegios(),
          tiposTela: this.productosService.getTiposDeTela()
        })
      );

      let { tipos, talles, colores, colegios, tiposTela } = dataMaestra;

      // 2. Procesar cada producto del Excel
      for (const producto of this.productos) {
        
        // Función interna para normalizar el texto del Excel
        const normalizar = (val: any) => val ? val.toString().trim() : '';

        // --- Tipo de Producto ---
        const nombreTipo = normalizar(producto.idtipoDeProducto);
        let tipo = tipos.find(t => t.nombre.toLowerCase() === nombreTipo.toLowerCase());
        if (!tipo && nombreTipo) {
          const nuevo = { id: this.generarId('tp', tipos), nombre: nombreTipo };
          tipo = await lastValueFrom(this.productosService.createTipoDeProducto(nuevo));
          tipos.push(tipo);
        }

        // --- Talle ---
        const nombreTalle = normalizar(producto.idtalle);
        let talle = talles.find(t => t.nombre.toLowerCase() === nombreTalle.toLowerCase());
        if (!talle && nombreTalle) {
          const nuevo = { id: this.generarId('t', talles), nombre: nombreTalle };
          talle = await lastValueFrom(this.productosService.createTalle(nuevo));
          talles.push(talle);
        }

        // --- Color ---
        const nombreColor = normalizar(producto.idcolor);
        let color = colores.find(c => c.nombre.toLowerCase() === nombreColor.toLowerCase());
        if (!color && nombreColor) {
          const nuevo = { id: this.generarId('c', colores), nombre: nombreColor };
          color = await lastValueFrom(this.productosService.createColor(nuevo));
          colores.push(color);
        }

        // --- Colegio ---
        const nombreColegio = normalizar(producto.idcolegio);
        let colegio = colegios.find(col => col.nombre.toLowerCase() === nombreColegio.toLowerCase());
        if (!colegio && nombreColegio) {
          const nuevo = { id: this.generarId('col', colegios), nombre: nombreColegio };
          colegio = await lastValueFrom(this.productosService.createColegio(nuevo));
          colegios.push(colegio);
        }

        // --- Tipo de Tela ---
        const nombreTela = normalizar(producto.idtipoDeTela);
        let tipoTela = tiposTela.find(tt => tt.nombre.toLowerCase() === nombreTela.toLowerCase());
        if (!tipoTela && nombreTela) {
          const nuevo = { id: this.generarId('tt', tiposTela), nombre: nombreTela };
          tipoTela = await lastValueFrom(this.productosService.createTipoDeTela(nuevo));
          tiposTela.push(tipoTela);
        }

        // --- Reemplazar nombres por IDs en el objeto ---
        producto.idtipoDeProducto = tipo?.id || null;
        producto.idtalle = talle?.id || null;
        producto.idcolor = color?.id || null;
        producto.idcolegio = colegio?.id || null;
        producto.idtipoDeTela = tipoTela?.id || null;
      }

      // 3. Guardar todos los productos procesados
      this.productosService.saveProducts(this.productos).subscribe({
        next: () => {
          this.cargando = false;
          this.mensaje = '✅ Productos cargados exitosamente.';
          alert('¡Productos cargados exitosamente con IDs correctos!');
          this.productos = []; // Limpiar vista previa tras éxito
        },
        error: (err) => {
          this.cargando = false;
          this.mensaje = '❌ Error al guardar productos finales.';
          console.error(err);
        }
      });

    } catch (error) {
      this.cargando = false;
      this.mensaje = '❌ Error procesando el archivo. Verifique la conexión.';
      console.error("Error en el proceso:", error);
    }
  }

  generarId(prefijo: string, lista: any[]): string {
    const max = lista
      .map((item: any) => parseInt(item.id.replace(/\D/g, ''), 10))
      .filter(n => !isNaN(n))
      .reduce((a, b) => Math.max(a, b), 0);
    return `${prefijo}${(max + 1).toString().padStart(3, '0')}`;
  }

  descargarPlantilla(): void {
    const columnas = [{
        idtipoDeProducto: 'Ej: Remera',
        idtalle: 'Ej: L',
        idcolor: 'Ej: Azul',
        idcolegio: 'Ej: San Martin',
        idtipoDeTela: 'Ej: Algodon',
        cantidadEnStock: 10,
        precioCompraUnitario: 1000,
        precioVentaUnitario: 1500
    }];

    const hoja = XLSX.utils.json_to_sheet(columnas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Productos');
    const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'plantilla_productos.xlsx');
  }
}