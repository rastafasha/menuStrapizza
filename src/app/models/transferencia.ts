import { Tienda } from "./tienda.model";

export class Transferencia{
  constructor(

        public user: string,
        public bankName: string,
        public metodo_pago: string,
        public amount: number,
        public referencia: string,
        public paymentday: Date,
        public status: boolean,
        public local: Tienda,
        public createdAt: Date,
        public updatedAt: Date,
        public _id?: string

  ){}

}
