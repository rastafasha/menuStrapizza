import { Tienda } from "./tienda.model";

export class Solicitud{
    constructor(
        public _id: string,
        public user: string,
        public pedidoList: Array<any>,
        public tienda: Tienda,
        public status: string,
        public createdAt: Date,
    ){
    }
}
