import { Pedido } from "./pedido.model";
import { Tienda } from "./tienda.model";
import { Usuario } from "./usuario.model";


export class Asignacion {
     constructor(
        public driver : Usuario,
        public tienda : Tienda,
        public pedido: Pedido,
        public status: string,
        public statusD: string,
        public statusC: string,
        public driverPosition: string,
        public deliveryPosition: string,
        public _id?: string
    
      ){
      }
}