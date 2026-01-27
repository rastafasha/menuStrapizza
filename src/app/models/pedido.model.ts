import { Tienda } from "./tienda.model";

export class Pedido{
    constructor(
        public _id: string,
        public user: string,
        public pedido: Array<any>,
        public tienda: Tienda,
        public status: string,
        public createdAt: Date,
    ){
    }
}