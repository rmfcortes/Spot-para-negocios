import { Direccion } from './direccion';

export interface Perfil {
    abierto: boolean;
    id: string;
    formas_pago: FormaPago;
    nombre: string;
    logo: string;
    descripcion: string;
    portada: string;
    categoria: string;
    subCategoria: string[];
    telefono: string;
    direccion: Direccion;
    tipo: string;
    region: string;
    display?: boolean;
    productos?: number;
    preparacion?: number;
    envio?: number;
    entrega?: string;
    whats?: string;
}

export interface FormaPago {
    efectivo: boolean;
    tarjeta: boolean;
}

export interface Region {
    ciudad: string;
    referencia: string;
    ubicacion: Ubicacion;
}

export interface Ubicacion {
    lat: number;
    lng: number;
}

export interface Categoria {
    categoria: string;
    foto: string;
}

export interface FunctionInfo {
    abierto: boolean;
    categoria: string;
    cuenta?: string;
    foto: string;
    idNegcio: string;
    nombre: string;
    subCategoria: string[];
    tipo: string;
}
