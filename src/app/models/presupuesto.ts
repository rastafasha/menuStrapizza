import { Usuario } from "./usuario.model";

export class Presupuesto {
    _id!: string;
    tienda?: string;
    cliente?: Usuario;
    title!: string;
    description!: string;
    observaciones!: string;
    pedidoList!: Array<any>;
    amount!: number;
    cantidadPersonas!: number;
    fechaEvento!: Date;
    status?: 'PENDING' | 'APROVED' | 'REFUSED';
    createdAt!: Date;
    updatedAt!: Date;

}
