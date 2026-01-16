import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VentasService } from '../../services/ventas.service';
import { ProductosService } from '../../services/productos.service';
import { ClientesService } from '../../services/clientes.service';
import { PedidosService } from '../../services/pedidos.service';
import { forkJoin } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

Chart.register(...registerables);

@Component({
  selector: 'app-sale',
  standalone: false,
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export class SaleComponent implements OnInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef;

  ventas: any[] = [];
  pedidos: any[] = [];
  clientes: any[] = [];
  productos: any[] = [];

  totalVentasMes = 0;
  porcentajeEntregados = 0;
  montoTotalVendido = 0;

  // 🔹 nuevas propiedades para la vista combinada
  totalPedidos = 0;
  ventasConcretadas = 0;
  porcentajeVentas = 0;

  mesActual = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();
  chart: any;
  ventaSeleccionada: any = null;
  pedidoDetalle: any = null;

  constructor(
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private productosService: ProductosService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.clientesService.getClients().subscribe(c => (this.clientes = c));
    this.productosService.getProducts().subscribe(p => (this.productos = p));

    this.pedidosService.getPedidos().subscribe(pedidos => {
      this.pedidos = pedidos;
      this.actualizarVista();
    });
  }

  actualizarVista(): void {
    this.filtrarVentas();
    this.calcularEstadisticas();
    this.generarGrafico();
  }

  filtrarVentas(): void {
    this.ventas = this.pedidos.filter(p => p.estado === 'Entregado');
  }

  calcularEstadisticas(): void {
    const pedidosDelMes = this.pedidos.filter(p => {
      const f = new Date(p.fechaPedido);
      return f.getMonth() + 1 === this.mesActual && f.getFullYear() === this.anioActual;
    });

    const entregadosDelMes = pedidosDelMes.filter(p => p.estado === 'Entregado');

    // 🔹 estadísticas principales
    this.totalPedidos = pedidosDelMes.length;
    this.ventasConcretadas = entregadosDelMes.length;
    this.porcentajeVentas = this.totalPedidos
      ? Math.round((this.ventasConcretadas / this.totalPedidos) * 100)
      : 0;

    // 🔹 cálculo de totales monetarios
    this.montoTotalVendido = entregadosDelMes.reduce((total, venta) => {
      return total + this.getTotalPedido(venta);
    }, 0);
  }

  generarGrafico(): void {
    if (this.chart) this.chart.destroy();

    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: (chart: any) => {
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#28a745';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.porcentajeVentas}%`, width / 2, height / 2);
        ctx.restore();
      }
    };

    const data = {
      labels: ['Entregados', 'Pendientes'],
      datasets: [
        {
          data: [this.ventasConcretadas, this.totalPedidos - this.ventasConcretadas],
          backgroundColor: ['#28a745', '#ffc107'],
          borderWidth: 0,
          cutout: '70%' // 🔹 ahora sí funciona
        }
      ]
    };

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { enabled: true },
          title: { display: true, text: 'Rendimiento mensual' }
        }
      },
      plugins: [centerTextPlugin]
    };

    this.chart = new Chart(this.salesChartRef.nativeElement, config);
  }

  getNombreCliente(id: string): string {
    const cliente = this.clientes.find(c => c.id === id);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente desconocido';
  }

  getTotalPedido(pedido: any): number {
    return pedido.productos.reduce((total: number, item: any) => {
      const producto = this.productos.find(p => p.id === item.productoId);
      return total + (producto ? producto.precioVentaUnitario * item.cantidad : 0);
    }, 0);
  }

  // 🔹 Nuevo método auxiliar
  getPrecioProducto(id: string): number {
    const producto = this.productos.find(p => p.id === id);
    return producto ? producto.precioVentaUnitario : 0;
  }

  getNombreProducto(id: string): string {
    const producto = this.productos.find(p => p.id === id);
    return producto ? producto.nombre : id;
  }

  cambiarPeriodo(): void {
    this.actualizarVista();
  }

  abrirDetalle(venta: any): void {
    this.ventaSeleccionada = venta;

    this.pedidoDetalle = this.pedidos.find(
      p => p.id === venta.idPedido
    );

    if (!this.pedidoDetalle) {
      console.warn('No se encontró el pedido asociado', venta);
    }
  }

  cerrarDetalle(): void {
    this.ventaSeleccionada = null;
    this.pedidoDetalle = null;
  }


  exportarPDF(): void {
    const doc = new jsPDF();

    // -----------------------------
    // ENCABEZADO PROFESIONAL
    // -----------------------------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);

    // Título
    doc.text('Reporte de Ventas', 14, 20);

    // Fecha del reporte
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 28);

    // Línea divisoria
    doc.setDrawColor(180);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // -----------------------------
    // TABLA
    // -----------------------------
    const data = this.ventas.map(v => [
      v.id,
      this.getNombreCliente(v.cliente),
      v.fechaPedido,
      `$ ${this.getTotalPedido(v).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Cliente', 'Fecha', 'Total']],
      body: data,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [108, 99, 255], // violeta como tu sistema
        textColor: 255,
        fontSize: 11,
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 255] // gris/lavanda suave
      },
      margin: { top: 40 }
    });

    // -----------------------------
    // TOTAL GENERAL DESTACADO
    // -----------------------------
    const total = this.ventas.reduce(
      (acc, v) => acc + this.getTotalPedido(v),
      0
    );

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`Total General Vendido: $ ${total.toLocaleString()}`, 14, finalY);

    // Línea final
    doc.setDrawColor(200);
    doc.line(14, finalY + 3, 196, finalY + 3);

    // -----------------------------
    // PIE DE PÁGINA PROFESIONAL
    // -----------------------------
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(140);

      doc.text(
        `Pisa Pisuela - Sistema de Gestión de Uniformes Escolares`,
        14,
        285
      );

      doc.text(`Página ${i} de ${pageCount}`, 180, 285, { align: 'right' });
    }

    // Guardar
    doc.save('reporte_ventas.pdf');
  }

  exportarExcel(): void {
    const data = this.ventas.map(v => ({
      ID: v.id,
      Cliente: this.getNombreCliente(v.cliente),
      Fecha: v.fechaPedido,
      Total: this.getTotalPedido(v)
    }));

    // Crear hoja
    const ws = XLSX.utils.json_to_sheet(data);

    // -------------------------------
    // 🔹 ESTILOS DE ENCABEZADO
    // -------------------------------
    const headerCells = ["A1", "B1", "C1", "D1"];
    headerCells.forEach(c => {
      ws[c].s = {
        fill: { fgColor: { rgb: "6C63FF" } }, // violeta corporativo
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    });

    // -------------------------------
    // 🔹 ESTILO GENERAL DE CELDAS
    // -------------------------------
    const range = XLSX.utils.decode_range(ws["!ref"]!);

    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) continue;

        ws[cellRef].s = {
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        };

        // Formato de moneda en columna Total
        if (C === 3) {
          ws[cellRef].z = '$ #,##0.00';
        }
      }
    }

    // -------------------------------
    // 🔹 AUTO AJUSTE DE COLUMNAS
    // -------------------------------
    const colWidths = data.reduce(
      (w: number[], r: any) => {
        Object.values(r).forEach((val: any, i) => {
          w[i] = Math.max(w[i] || 10, val.toString().length);
        });
        return w;
      },
      []
    );

    ws["!cols"] = colWidths.map(w => ({ width: w + 5 }));

    // -------------------------------
    // 🔹 ACTIVAR FILTROS AUTOMÁTICOS
    // -------------------------------
    if (ws["!ref"]) {
      ws["!autofilter"] = { ref: ws["!ref"] as string };
    }


    // -------------------------------
    // 🔹 CONGELAR FILA DEL ENCABEZADO
    // -------------------------------
    ws["!freeze"] = { xSplit: 0, ySplit: 1 };

    // Crear libro
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Ventas');

    // Exportar
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout]), 'ventas.xlsx');
  }

}