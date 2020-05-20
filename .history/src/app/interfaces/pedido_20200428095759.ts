import { Direccion } from './direccion';
import { Producto } from './producto';

export interface Pedido {
    aceptado: any;
    cliente: Cliente;
    entrega: string;
    id?: string;
    productos: Producto[];
    repartidor?: RepartidorPedido;
    total: number;
    negocio: NegocioPedido;
}

export interface NegocioPedido {
    entrega: string;
}

export interface Cliente {
    direccion: Direccion;
    nombre: string;
    telefono?: string;
    uid: string;
}

export interface RepartidorPedido {
    nombre: string;
    telefono: string;
    foto: string;
    lat?: number;
    lng?: number;
    id: string;
}

export interface PedidoPendienteRepartidor {
    last_solicitud: number;
    pedido: Pedido;
}


