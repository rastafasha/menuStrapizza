export class Ticket {
  public tema?:string;
  public estado?: number;
  public status?:number;
  public user?:string;
  public venta?:string;
  public _id?:string;
  public createdAt?:Date;
}

export class Mensaje {
  public de?:string;
  public para?:string;
  public msm?: number;
  public ticket?:string;
  public _id?:string;
  public createdAt?:Date;
}
