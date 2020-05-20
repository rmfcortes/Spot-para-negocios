export interface Rate {
    calificaciones: number;
    promedio: number;
}

export interface PerfilNegRate {
    foto: string;
    nombre: string;
    idNegocio: string;
}

export interface ComentarioNegocio {
    comentarios: string;
    idNegocio: string;
    puntos: number;
}

export interface ComentarioRepartidor {
    comentarios: string;
    idRepartidor: string;
    puntos: number;
}
