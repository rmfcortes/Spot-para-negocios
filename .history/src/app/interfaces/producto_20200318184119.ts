export interface Producto {
    codigo?: string;
    descripcion: string;
    id: string;
    nombre: string;
    pasillo: string;
    precio: number;
    url: string;
    unidad?: string;
    variables?: boolean;
    foto?: string;
    // para pedido
    cantidad?: number;
    observaciones?: string;
    complementos?: ProductoComplemento[];
}

export interface Complemento {
    titulo: string;
    obligatorio: boolean;
    limite: number;
    productos: ProductoComplemento[];
}

export interface ProductoComplemento {
    precio?: any;
    nombre: string;
}

export interface ProductoPasillo {
    nombre: string;
    productos: Producto[];
}
