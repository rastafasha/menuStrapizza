import { Facturacion } from "./facturacion"
import { User } from "./user"

export class Notificacion {
    usuario?: User;
    titulo?: string; 
    mensaje?: string; 
    tipo?: 'PAGO_APROBADO' | 'PAGO_RECHAZADO' | 'NUEVA_FACTURA' | 'AVISO_MOROSIDAD' | 'COMUNICADO_ADMIN' | 'MENSAJE_DIRECTO';
    leido?: boolean;
    referenciaId?: string;
    createdAt?: Date;
}