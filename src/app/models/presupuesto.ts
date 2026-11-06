import { Usuario } from "./usuario.model";

export class Presupuesto {
    _id!: string;
    tienda?: string;
    cliente?: Usuario;
    first_name!: string;
    last_name!: string;
    telefono!: string;
    address!: string;
    title!: string;
    description!: string;
    observaciones!: string;
    pedidoList!: Array<any>;
    amount!: number;
    cantidadPersonas!: number;
    fechaEvento!: Date;
    hora!: string;
    status?: 'PENDING' | 'APROVED' | 'REFUSED';
    createdAt!: Date;
    updatedAt!: Date;

}
