import { Usuario } from "./usuario.model";

export class Notificacion {
    usuario?: Usuario;
    titulo?: string; 
    mensaje?: string; 
   
    tipo?: 'PAGO_APROBADO'|
'PAGO_RECHAZADO'|
'NUEVO_PEDIDO'|
'PEDIDO_APROBADO'|
'PEDIDO_RECHAZADO'|
'PEDIDO_FINALIZADO'|
'RESERVACION_CONFIRMADA'|
'RESERVACION_CANCELADA'|
'RESERVACION_COMPLETADA'|
'NUEVA_RESERVACION'|
'NUEVO_MENSAJE'|
'AVISO_GENERAL';;
    leido?: boolean;
    referenciaId?: string;
    createdAt?: Date;
}