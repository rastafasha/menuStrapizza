import { Tienda } from "./tienda.model";

export class Pedido{
    constructor(
        public _id: string,
        public user: string,
        public pedidoList: Array<any>,
        public tienda: Tienda,
        public status: string,
        public delivery: string,
        public deliveryAddres: string,
        public createdAt: Date,
    ){
    }
}