export interface Pedido {
    id: string;
    cliente: string;
    fechaPedido: Date;
    senia: number;
    estado: string;
    productos: { productoId: string; cantidad: number }[];
    comentarios: string
}
