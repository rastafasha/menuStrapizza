import { Tienda } from "./tienda.model";

export class Paypal{
    constructor(
  
          public clientIdPaypal: string,
          public clientSecret: string,
          public mode: string,
          public local: Tienda,
          public email: string,
          public createdAt: Date,
          public updatedAt: Date,
          public _id?: string
  
    ){}
  
  }

  
  