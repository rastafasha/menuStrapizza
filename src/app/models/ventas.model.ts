
export class Venta {
  _id!: string;
  createdAt!: string;
  user!: string;
  local!: string;
  total_pagado!: number;
  info_cupon!: string;
  idtransaccion!: string;
  metodo_pago!: string;
  precio_envio!: string;
  tipo_envio!: string;
  tiempo_estimado!: string;
  direccion!: string;
  destinatario!: string;
  referencia!: string;
  pais!: string;
  zip!: string;
  ciudad!: string;
  tracking_number!: string;
  day!: string;
  month!: string;
  year!: string;
  estado!: string;
}


export class Cancelacion {
  _id!: string;
  createdAt!: string;
  mensaje!: string;
  estado!: string;
  user!: string;
  venta!: string;
}
